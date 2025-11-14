import chokidar from 'chokidar'
import { Stats } from 'fs'
import Gitignore from 'gitignore-fs'
import { getProjectBase } from '../getProject.ts'
import { collectExports } from './collectExports.ts'
import path from 'path'
import fs from 'fs-extra'
import { babelOptions } from './babelOptions.ts'
import { transformFileAsync } from '@babel/core'
import { makeDistPackageJson } from './makeDistPackageJson.ts'
import { nodeFileTrace } from '@vercel/nft'
import asyncThrottle from '@jcoreio/async-throttle'
import { PackageJsonSchema } from '../PackageJsonSchema.ts'

export async function buildWatchServer({
  cwd = process.cwd(),
  devMode,
  onChange,
}: {
  cwd?: string
  devMode?: boolean
  onChange?: (file: string) => void
} = {}) {
  const {
    projectDir,
    packageJson,
    packageJsonFile,
    distDir,
    devDir,
    devOutDir,
    clientAssetsFile,
  } = await getProjectBase(cwd)

  const ctsOptions = babelOptions('commonjs')
  const mtsOptions = babelOptions(false)

  async function traceFiles() {
    const packageJson = PackageJsonSchema.parse(
      await fs.readJson(packageJsonFile)
    )
    const serverEntrypoints = new Set<string>()
    collectExports(packageJson.exports, undefined, serverEntrypoints)

    const fileTrace = await nodeFileTrace(
      [...serverEntrypoints].map((file) => path.resolve(projectDir, file)),
      {
        processCwd: projectDir,
        base: projectDir,
        readFile: async (src: string) => {
          if (/\.[cm]?tsx?$/.test(src) && !/\.d\.[cm]?tsx?$/.test(src)) {
            const babelOptions =
              /\.ctsx?$/.test(src) ? ctsOptions
              : /\.mtsx?$/.test(src) ? mtsOptions
              : packageJson.type === 'module' ? mtsOptions
              : ctsOptions
            const transformed = await transformFileAsync(src, babelOptions)
            return transformed?.code || ''
          }
          return await fs.readFile(src)
        },
      }
    )
    // make sure to at least build the output package.json file if there are client entrypoints
    // even if there are no server entrypoints
    if (
      !fileTrace.fileList.size &&
      packageJson.clarity?.client?.entrypoints.length
    ) {
      const relativePackageJsonFile = path.relative(projectDir, packageJsonFile)
      fileTrace.fileList.add(relativePackageJsonFile)
      fileTrace.reasons.set(relativePackageJsonFile, {
        ignored: false,
        parents: new Set(),
        type: ['initial'],
      })
    }
    return fileTrace
  }
  let fileTracePromise = traceFiles()

  // @ts-expect-error ESM type defs need to be fixed
  const retrace = asyncThrottle(async () => {
    fileTracePromise = traceFiles()
    await fileTracePromise
  }, 1000)

  const outDir = devMode ? devOutDir : distDir
  await fs.mkdirs(outDir)

  if (devMode) {
    await fs
      .symlink(
        packageJson.version,
        path.join(path.dirname(devOutDir), 'active')
      )
      .catch((error: unknown) => {
        if (
          error instanceof Error &&
          'code' in error &&
          error.code === 'EEXIST'
        )
          return
        throw error
      })
  }

  // create the watcher and register listeners in a sync function to make sure
  // we don't accidentally await anything before registering listeners (there
  // was a bug with this)
  return (() => {
    const gitignore = new Gitignore()

    const watcher = chokidar.watch(projectDir, {
      alwaysStat: true,
      ignored: (path: string, stats?: Stats) =>
        gitignore.ignoresSync(stats?.isDirectory() ? path + '/' : path) &&
        path !== clientAssetsFile,
    })

    function toOutPath(file: string) {
      return path
        .join(outDir, path.relative(projectDir, file))
        .replace(/\.([cm])?tsx?$/, '.$1js')
    }

    let ready = false

    const handleAsync = async (src: string, stats?: Stats) => {
      const wasReady = ready
      if (stats?.isDirectory()) return

      const relativeSrc = path.relative(projectDir, src)
      const { fileList } = await fileTracePromise
      if (!fileList.has(relativeSrc)) return

      void retrace()

      const dest = toOutPath(src)

      if (/\.[cm]?tsx?$/.test(src) && !/\.d\.[cm]?tsx?$/.test(src)) {
        const babelOptions =
          /\.ctsx?$/.test(src) ? ctsOptions
          : /\.mtsx?$/.test(src) ? mtsOptions
          : packageJson.type === 'module' ? mtsOptions
          : ctsOptions
        const transformed = await transformFileAsync(src, babelOptions)
        if (!transformed) return ''
        const { code, map } = transformed
        if (code != null) {
          await fs.mkdirs(path.dirname(dest))
          await fs.writeFile(dest, code, {
            encoding: 'utf8',
            mode: stats?.mode,
          })
          if (map != null) {
            await fs.writeJson(`${dest}.map`, map, { mode: stats?.mode })
          }
        }
      } else if (src === packageJsonFile) {
        const distPackageJson = await makeDistPackageJson({ cwd })
        await fs.writeJson(dest, distPackageJson, {
          spaces: 2,
          mode: stats?.mode,
        })
        // create dev mode symlinks for dependencies in the volumes mounted into the
        // Clarity docker container
        const nodeModulesDir = path.join(path.dirname(dest), 'node_modules')
        await fs.remove(nodeModulesDir)
        await fs.mkdir(nodeModulesDir)
        for (const dep in distPackageJson.dependencies) {
          if (dep === '@jcoreio/clarity-plugin-api') continue
          const symlinkPath = path.join(nodeModulesDir, dep)
          const symlinkTarget = path.join(devDir, 'node_modules/.external', dep)
          await fs.mkdirs(path.dirname(symlinkPath))
          await fs.symlink(
            path.relative(path.dirname(symlinkPath), symlinkTarget),
            symlinkPath
          )
        }
      } else {
        await fs.mkdirs(path.dirname(dest))
        await fs.copyFile(src, dest)
      }
      if (wasReady) onChange?.(src)
    }

    const handle = (src: string, stat?: Stats) => {
      const dest = toOutPath(src)
      handleAsync(src, stat).catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.error(
          `failed to copy/transpile ${path.relative(process.cwd(), src)} -> ${path.relative(process.cwd(), dest)}`,
          err
        )
      })
    }

    watcher.on('ready', () => (ready = true))
    watcher.on('add', handle)
    watcher.on('change', handle)

    async function handleUnlinkAsync(src: string) {
      const wasReady = ready
      const dest = toOutPath(src)

      const relativeSrc = path.relative(projectDir, src)
      const { fileList } = await fileTracePromise
      if (!fileList.has(relativeSrc)) return

      void retrace()

      await fs.unlink(dest)
      if (wasReady) onChange?.(src)
    }
    watcher.on('unlink', (src: string) => {
      const dest = toOutPath(src)
      void handleUnlinkAsync(src).catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.error(
          `failed to remove ${path.relative(process.cwd(), dest)}`,
          err
        )
      })
    })
    return watcher
  })()
}
