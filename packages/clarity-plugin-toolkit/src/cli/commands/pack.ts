import * as yargs from 'yargs'
import { getProjectBase } from '../../getProject'
import { glob } from 'glob'
import path from 'path'
import fs from 'fs-extra'
import { collectExports } from '../../server/collectExports'
import { nodeFileTrace } from '@vercel/nft'
import archiver from 'archiver'
import { createGzip } from 'zlib'
import { makePacklist, toPosix } from '../../server/makePacklist'
import emitted from 'p-event'
import { parseSigningKey } from '../../getSigningKey'
import crypto, { KeyObject } from 'crypto'
import { pipeline } from 'stream/promises'
import { PassThrough } from 'stream'

export const command = 'pack'
export const description = `pack code into a tarball for deployment`

type Options = {}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 pack')

export async function handler(): Promise<void> {
  const {
    projectDir,
    distDir,
    distClientDir,
    distPackageJsonFile,
    distTarball,
    signingKeyFile,
  } = await getProjectBase(process.cwd())

  let signingKey: { id: number; privateKey: KeyObject } | undefined
  if (await fs.pathExists(signingKeyFile)) {
    signingKey = parseSigningKey(await fs.readFile(signingKeyFile, 'utf8'))
  }
  const startFiles = new Set(
    await glob(path.join(path.relative(distDir, distClientDir), '**'), {
      cwd: distDir,
      nodir: true,
      dot: true,
      ignore: [],
    })
  )
  const packageJson = await fs.readJson(distPackageJsonFile)
  if (signingKey) {
    packageJson.clarity = {
      ...packageJson.clarity,
      signatureVerificationKeyId: signingKey.id,
    }
  }
  collectExports(packageJson.exports, undefined, startFiles)

  const signList: { file: string; content?: string | Buffer }[] = []

  const { fileList: fileSet } = await nodeFileTrace(
    [...startFiles].map((f) => path.resolve(distDir, f)),
    {
      processCwd: distDir,
      base: projectDir,
    }
  )
  const fileList = [...fileSet]

  const archive = archiver('tar')
  const archiveStream = archive
    .pipe(createGzip())
    .pipe(fs.createWriteStream(distTarball))
  let archiveError: Error | undefined = undefined
  archive.once('error', (err) => {
    archiveError = err
  })

  const stripParentDirs = (file: string) =>
    file.replace(
      new RegExp(`^(\\.\\.${path.sep === '\\' ? '\\\\' : path.sep})+`),
      ''
    )

  const ownFiles = fileList
    .filter(
      (file) => !stripParentDirs(toPosix(file)).startsWith('node_modules/')
    )
    .sort()
  const ownFileBase = `${toPosix(path.relative(projectDir, distDir))}/`

  const packageJsonStr = JSON.stringify(packageJson, null, 2)
  archive.append(packageJsonStr, { name: 'package/package.json' })
  signList.push({
    file: path.join(distDir, 'package.json'),
    content: packageJsonStr,
  })

  for (const file of ownFiles) {
    const posixFile = toPosix(file)
    if (!posixFile.startsWith(ownFileBase)) continue
    const name = posixFile.substring(ownFileBase.length)
    if (name === 'package.json') continue
    archive.file(path.join(projectDir, file), { name: `package/${name}` })
    signList.push({ file })
  }

  const dependencies = fileList.flatMap((file) => {
    const pkg = /^node_modules[/]((@[^/]+\/)?[^/]+)/.exec(toPosix(file))?.[1]
    if (
      pkg &&
      pkg !== '@jcoreio/clarity-plugin-api' &&
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

  for (const file of packlist.files) {
    archive.file(path.resolve(projectDir, file), {
      name: `package/${stripParentDirs(file)}`,
    })
    signList.push({ file })
  }
  for (const [from, { target, mode }] of packlist.symlinks.entries()) {
    const linkpath = stripParentDirs(from)
    const baseDir = path.dirname(linkpath)
    const resolvedTarget = path.normalize(path.join(baseDir, target))
    const finalTarget =
      resolvedTarget.startsWith('..') ?
        path.relative(baseDir, stripParentDirs(resolvedTarget))
      : target
    archive.symlink(`package/${linkpath}`, finalTarget, mode)
    signList.push({ file: linkpath, content: finalTarget })
  }

  const { default: pMap } = await import('p-map') // p-map is pure ESM
  if (signingKey) {
    const signatures = await pMap(
      signList,
      async ({ file, content }) => {
        const signer = crypto.createSign('SHA256')
        if (content) {
          const input = new PassThrough()
          input.end(content)
          await pipeline(input, signer)
        } else {
          await pipeline(fs.createReadStream(file), signer)
        }
        const posixFile = stripParentDirs(toPosix(file))
        const relFile =
          posixFile.startsWith('node_modules/') ? posixFile : (
            toPosix(path.relative(distDir, file))
          )
        return [relFile, signer.sign(signingKey.privateKey).toString('base64')]
      },
      { concurrency: 1024 }
    )
    const finalSignatures = Object.fromEntries(
      signatures.sort(([a], [b]) =>
        a > b ? 1
        : a < b ? -1
        : 0
      )
    )
    archive.append(JSON.stringify(finalSignatures, null, 2), {
      name: `package/signatures-${signingKey.id}.json`,
    })
  }

  // @typescript-eslint kinda sux
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (archiveError) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw archiveError
  }
  await Promise.all([archive.finalize(), emitted(archiveStream, 'close')])
  // eslint-disable-next-line no-console
  console.error(`wrote ${path.relative(process.cwd(), distTarball)}`)
}
