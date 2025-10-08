import { getProjectBase } from '../getProject'
import { nodeFileTrace } from '@vercel/nft'
import fs from 'fs-extra'
import path from 'path'
import { transformFileAsync } from '@babel/core'
import { collectExports } from './collectExports'
import { babelOptions } from './babelOptions'

export async function buildServer({
  cwd = process.cwd(),
}: { cwd?: string } = {}) {
  const { projectDir, packageJson, distDir } = await getProjectBase(cwd)
  const serverEntrypoints = new Set<string>()
  collectExports(packageJson.exports, undefined, serverEntrypoints)
  if (!serverEntrypoints.size) return

  await fs.mkdirs(distDir)

  const ctsOptions = babelOptions('commonjs')
  const mtsOptions = babelOptions(false)

  const { fileList: fileSet } = await nodeFileTrace(
    [...serverEntrypoints].map((file) => path.resolve(projectDir, file)),
    {
      processCwd: projectDir,
      base: projectDir,
      readFile: async (src: string) => {
        const relativeSrc = path.relative(projectDir, src)
        const stats = await fs.stat(src)
        const dest = path
          .resolve(distDir, relativeSrc)
          .replace(/\.([cm])?tsx?$/, '.$1js')

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
            // eslint-disable-next-line no-console
            console.error(
              `${path.relative(cwd, src)} -> ${path.relative(cwd, dest)}`
            )
            await fs.mkdirs(path.dirname(dest))
            await fs.writeFile(dest, code, {
              encoding: 'utf8',
              mode: stats.mode,
            })
            if (map != null) {
              await fs.writeJson(`${dest}.map`, map, { mode: stats.mode })
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

  const { default: pMap } = await import('p-map') // p-map is pure ESM
  await pMap(
    otherAssets,
    async (relativeSrc) => {
      const src = path.resolve(projectDir, relativeSrc)
      const dest = path.resolve(distDir, relativeSrc)

      // eslint-disable-next-line no-console
      console.error(
        `${path.relative(process.cwd(), src)} -> ${path.relative(process.cwd(), dest)}`
      )
      await fs.mkdirs(path.dirname(dest))
      await fs.copy(src, dest)
    },
    { concurrency: 1024 }
  )
}
