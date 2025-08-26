import { getProjectBase } from './getProject'
import { nodeFileTrace } from '@vercel/nft'
import fs from 'fs-extra'
import path from 'path'
import { distServerDir as relDistServerDir } from './constants'
import { transformFileAsync } from '@babel/core'
import archiver from 'archiver'
import { createGzip } from 'zlib'
import emitted from 'p-event'

export async function buildServer({
  cwd = process.cwd(),
}: { cwd?: string } = {}) {
  const { projectDir, packageJson } = await getProjectBase(cwd)
  const serverEntry = packageJson.contributes.server
  if (!serverEntry) return

  const distServerDir = path.resolve(projectDir, relDistServerDir)
  await fs.mkdirs(distServerDir)
  await fs.emptydir(distServerDir)
  const tarballFilename = `${packageJson.name.replace(/^@/, '').replace(/\//, '-')}-${packageJson.version}.tgz`

  const tarballFile = path.resolve(distServerDir, tarballFilename)

  const archive = archiver('tar')
  const archiveStream = archive
    .pipe(createGzip())
    .pipe(fs.createWriteStream(tarballFile))
  let archiveError: Error | undefined = undefined
  archive.once('error', (err) => {
    archiveError = err
  })

  const transformedPackageJson = JSON.stringify(
    {
      ...packageJson,
      contributes: {
        ...packageJson.contributes,
        server: serverEntry.replace(/\.([cm])?tsx?$/, '.$1js'),
      },
    },
    null,
    2
  )
  archive.append(transformedPackageJson, {
    name: 'package.json',
    stats: await fs.stat(path.resolve(projectDir, 'package.json')),
  })
  // eslint-disable-next-line no-console
  console.error(
    `${path.relative(process.cwd(), path.resolve(projectDir, 'package.json'))} -> ${path.relative(process.cwd(), path.resolve(distServerDir, 'package.json'))}`
  )
  await fs.writeFile(
    path.resolve(distServerDir, 'package.json'),
    transformedPackageJson,
    'utf8'
  )

  const babelOptions = {
    cwd: projectDir,
    babelrc: false,
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: { node: 20 },
          modules: false,
          exclude: ['proposal-dynamic-import'],
        },
      ],
      [require.resolve('@babel/preset-typescript')],
    ],
  }
  const { fileList: fileSet } = await nodeFileTrace(
    [path.resolve(projectDir, serverEntry)],
    {
      processCwd: projectDir,
      base: projectDir,
      readFile: async (src: string) => {
        const relativeSrc = path.relative(projectDir, src)
        const stats = await fs.stat(src)
        const dest = path
          .resolve(distServerDir, relativeSrc)
          .replace(/\.([cm])?tsx?$/, '.$1js')

        if (
          /\.[cm]?tsx?$/.test(relativeSrc) &&
          !/\.d\.[cm]?tsx?$/.test(relativeSrc)
        ) {
          const transformed = await transformFileAsync(src, babelOptions)
          if (!transformed) return ''
          const { code, map } = transformed
          if (code != null) {
            // eslint-disable-next-line no-console
            console.error(
              `${path.relative(cwd, relativeSrc)} -> ${path.relative(cwd, dest)}`
            )
            await fs.mkdirs(path.dirname(dest))
            await fs.writeFile(dest, code, 'utf8')
            archive.append(code, {
              name: relativeSrc.replace(/\.([cm])?tsx?$/, '.$1js'),
              stats,
            })
            if (map != null) {
              await fs.writeJson(`${dest}.map`, map)
              archive.append(JSON.stringify(map), {
                name: `${relativeSrc}.map`,
                stats,
              })
            }
          }
          return code || ''
        }
        return await fs.readFile(src)
      },
    }
  )

  const fileList = [...fileSet]

  const otherAssets = fileList.filter(
    (file) =>
      file !== 'package.json' &&
      !file.startsWith('node_modules' + path.sep) &&
      (!/\.[cm]?tsx?$/.test(file) || /\.d\.[cm]?tsx?$/.test(file))
  )

  await Promise.all(
    otherAssets.map(async (relativeSrc) => {
      const stats = await fs.stat(relativeSrc)
      const src = path.resolve(projectDir, relativeSrc)
      const dest = path.resolve(distServerDir, relativeSrc)

      // eslint-disable-next-line no-console
      console.error(
        `${path.relative(process.cwd(), src)} -> ${path.relative(process.cwd(), dest)}`
      )
      await fs.mkdirs(path.dirname(dest))
      await fs.copy(src, dest)
      archive.append(fs.createReadStream(src), { name: relativeSrc, stats })
    })
  )

  const packlist = await makePacklist({
    projectDir,
    dependencies: fileList.flatMap((file) => {
      const pkg = /^node_modules[/]((@[^/]+\/)?[^/]+)/.exec(toPosix(file))?.[1]
      return pkg && pkg !== '@jcoreio/clarity-feature-api' ? [pkg] : []
    }),
  })

  const stripParentDirs = (file: string) =>
    file.replace(
      new RegExp(`^(\\.\\.${path.sep === '\\' ? '\\\\' : path.sep})+`),
      ''
    )

  for (const file of packlist.files) {
    archive.file(path.resolve(projectDir, file), {
      name: stripParentDirs(file),
    })
  }
  for (const [from, { target, mode }] of packlist.symlinks.entries()) {
    const resolvedTarget = path.normalize(
      path.join(stripParentDirs(from), target)
    )
    const strippedTarget = stripParentDirs(resolvedTarget)
    archive.symlink(
      stripParentDirs(from),
      target.substring(resolvedTarget.length - strippedTarget.length),
      mode
    )
  }

  // @typescript-eslint kinda sux
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (archiveError) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw archiveError
  }
  await Promise.all([archive.finalize(), emitted(archiveStream, 'close')])
  // eslint-disable-next-line no-console
  console.error(`wrote ${path.relative(process.cwd(), tarballFile)}`)
}

type Symlink = {
  target: string
  mode: number
}

type Packlist = {
  files: Set<string>
  symlinks: Map<string, Symlink>
}

async function makePacklist({
  projectDir,
  dependencies,
}: {
  projectDir: string
  dependencies: string[]
}): Promise<Packlist> {
  const files: Set<string> = new Set()
  const symlinks: Map<string, Symlink> = new Map()

  const dirs: Set<string> = new Set()

  await Promise.all(dependencies.map((dep) => addDep(dep, projectDir)))

  async function addFiles(p: string): Promise<void> {
    const stat = await fs.lstat(p)
    if (stat.isFile()) {
      files.add(path.relative(projectDir, p))
    } else if (stat.isDirectory()) {
      const entries = await fs.readdir(p)
      await Promise.all(entries.map((e) => addFiles(path.join(p, e))))
    } else if (stat.isSymbolicLink()) {
      const realpath = path.resolve(path.dirname(p), await fs.readlink(p))
      symlinks.set(path.relative(projectDir, p), {
        target: path.relative(path.dirname(p), realpath),
        mode: stat.mode,
      })
      await addFiles(realpath)
    }
  }

  async function findDepDir(
    dep: string,
    basedir: string,
    origBasedir = basedir
  ): Promise<string> {
    const deppath = path.resolve(basedir, 'node_modules', dep)
    if (await fs.pathExists(deppath)) return deppath
    if (basedir === projectDir) {
      throw new Error(`failed to resolve dependency ${dep} in ${origBasedir}`)
    }
    let parentDir = path.dirname(basedir)
    if (path.basename(parentDir) === 'node_modules') {
      parentDir = path.dirname(parentDir)
    }
    return await findDepDir(dep, parentDir, origBasedir)
  }

  async function addDep(dep: string, basedir: string): Promise<void> {
    let deppath = await findDepDir(dep, basedir)
    let stat = await fs.lstat(deppath)
    while (stat.isSymbolicLink()) {
      const relpath = path.relative(projectDir, deppath)
      if (symlinks.has(relpath)) return
      const from = path.dirname(deppath)
      deppath = path.resolve(path.dirname(deppath), await fs.readlink(deppath))
      symlinks.set(relpath, {
        target: path.relative(from, deppath),
        mode: stat.mode,
      })
      stat = await fs.lstat(deppath)
    }
    const relpath = path.relative(projectDir, deppath)
    if (dirs.has(relpath)) return
    dirs.add(relpath)
    await addFiles(deppath)
    const packageJson = await fs.readJson(path.join(deppath, 'package.json'))
    const { dependencies } = packageJson
    if (dependencies) {
      await Promise.all(
        Object.keys(dependencies).map((dep) => addDep(dep, deppath))
      )
    }
  }

  return { files, symlinks }
}

function toPosix(file: string) {
  return process.platform === 'win32' ? file.replaceAll('\\', '/') : file
}
