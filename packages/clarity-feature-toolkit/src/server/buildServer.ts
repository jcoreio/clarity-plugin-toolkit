import { getProjectBase } from '../getProject'
import { nodeFileTrace } from '@vercel/nft'
import fs from 'fs-extra'
import path from 'path'
import { transformFileAsync } from '@babel/core'
import archiver from 'archiver'
import { createGzip } from 'zlib'
import emitted from 'p-event'
import { makePacklist, toPosix } from './makePacklist'
import { isEmpty, mapValues } from 'lodash'

export async function buildServer({
  cwd = process.cwd(),
}: { cwd?: string } = {}) {
  const { projectDir, packageJson, distServerDir, serverTarball } =
    await getProjectBase(cwd)
  const serverEntrypoints = packageJson.contributes.server
  if (isEmpty(serverEntrypoints)) return

  await fs.mkdirs(distServerDir)
  await fs.emptydir(distServerDir)

  const archive = archiver('tar')
  const archiveStream = archive
    .pipe(createGzip())
    .pipe(fs.createWriteStream(serverTarball))
  let archiveError: Error | undefined = undefined
  archive.once('error', (err) => {
    archiveError = err
  })

  const transformedPackageJson = JSON.stringify(
    {
      ...packageJson,
      contributes: {
        ...packageJson.contributes,
        server: mapValues(serverEntrypoints, (file) =>
          file?.replace(/\.([cm])?tsx?$/, '.$1js')
        ),
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
    `${path.relative(process.cwd(), path.resolve(projectDir, 'package.json'))} -> ${path.relative(process.cwd(), path.join(distServerDir, 'package.json'))}`
  )
  await fs.writeFile(
    path.join(distServerDir, 'package.json'),
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
    Object.values(serverEntrypoints).map((file) =>
      path.resolve(projectDir, file)
    ),
    {
      processCwd: projectDir,
      base: projectDir,
      readFile: async (src: string) => {
        const relativeSrc = path.relative(projectDir, src)
        const stats = await fs.stat(src)
        const dest = path
          .resolve(distServerDir, relativeSrc)
          .replace(/\.([cm])?tsx?$/, '.$1js')

        if (/\.[cm]?tsx?$/.test(src) && !/\.d\.[cm]?tsx?$/.test(src)) {
          const transformed = await transformFileAsync(src, babelOptions)
          if (!transformed) return ''
          const { code, map } = transformed
          if (code != null) {
            // eslint-disable-next-line no-console
            console.error(
              `${path.relative(cwd, src)} -> ${path.relative(cwd, dest)}`
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

  const dependencies = fileList.flatMap((file) => {
    const pkg = /^node_modules[/]((@[^/]+\/)?[^/]+)/.exec(toPosix(file))?.[1]
    if (
      pkg &&
      pkg !== '@jcoreio/clarity-feature-api' &&
      (packageJson.dependencies[pkg] || packageJson.devDependencies?.[pkg])
    ) {
      return [pkg]
    }
    return []
  })

  const packlist = await makePacklist({
    projectDir,
    dependencies,
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
  console.error(`wrote ${path.relative(process.cwd(), serverTarball)}`)
}
