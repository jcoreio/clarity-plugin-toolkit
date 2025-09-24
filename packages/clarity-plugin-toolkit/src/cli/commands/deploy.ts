import * as yargs from 'yargs'
import { getClarityUrl } from '../../getClarityUrl'
import path from 'path'
import fs from 'fs-extra'
import archiver from 'archiver'
import tar from 'tar-stream'
import { createGzip, createGunzip } from 'zlib'
import { AssetsSchema } from '../../client/AssetsSchema'
import z from 'zod'
import prompt from 'prompts'
import getProject from '../../getProject'
import crypto from 'crypto'
import * as build from './build'
import shouldBuild from '../../shouldBuild'
import { getSigningKey } from '../../getSigningKey'
import { pipeline } from 'stream/promises'
import { PassThrough, Readable } from 'stream'
import { ClarityPluginPackageJson } from '@jcoreio/clarity-plugin-api'
import { isReadable } from '../../util/isReadable'
import { copyReadable } from '../../util/copyReadable'
import semver from 'semver'
import { mapExports } from '../../util/mapExports'
import chalk from 'chalk'
import { confirm } from '../../util/confirm'
import dedent from 'dedent-js'
import open from 'open'
import { isInteractive } from '../../util/isInteractive'

export const command = 'deploy'
export const description = `build (if necessary) and deploy to Clarity`

type Options = {
  env?: string[]
}

const ErrorResponseSchema = z.object({
  code: z.string(),
})

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs
    .usage('$0 deploy')
    .option('env', {
      type: 'string',
      array: true,
      default: ['production'],
    })
    .option('setActive', {
      type: 'boolean',
      demandOption: false,
    })
    .option('restartServices', {
      type: 'boolean',
      demandOption: false,
    })

export async function handler({
  env,
}: yargs.Arguments<Options>): Promise<void> {
  const { packageJson, projectDir, clientAssetsFile, serverTarball } =
    await getProject()
  if (await shouldBuild({ env })) await build.handler({ env })

  const clarityUrl = await getClarityUrl()
  const signingKey = await getSigningKey()

  // eslint-disable-next-line no-console
  console.error(
    `🚀 Deploying ${packageJson.name}@${packageJson.version} to ${clarityUrl}...`
  )

  const doUpload = async ({
    overwrite,
  }: { overwrite?: boolean } = {}): Promise<void> => {
    const archive = archiver('tar')
    const clientAssets =
      (await fs.pathExists(clientAssetsFile)) ?
        AssetsSchema.parse(await fs.readJson(clientAssetsFile))
      : undefined
    const clientAssetsDir =
      clientAssets ?
        path.resolve(path.dirname(clientAssetsFile), clientAssets.outputPath)
      : undefined

    const hasServerTarball = await fs.pathExists(serverTarball)

    // declare a valid semver range for @jcoreio/clarity-plugin-api in the deployed package.json
    // so that Clarity can tell whether it's compatible
    if (
      packageJson.dependencies['@jcoreio/clarity-plugin-api'] &&
      !semver.validRange(
        packageJson.dependencies['@jcoreio/clarity-plugin-api']
      )
    ) {
      packageJson.dependencies['@jcoreio/clarity-plugin-api'] =
        `^${(await fs.readJson(path.join(projectDir, 'node_modules', '@jcoreio', 'clarity-plugin-api', 'package.json'))).version}`
    }

    const mappedExports = mapExports(packageJson.exports, (file) =>
      file.replace(/\.([cm])?[jt]sx?$/, '.$1js')
    )

    const packageJsonStr = JSON.stringify(
      {
        ...packageJson,
        clarity: {
          signatureVerificationKeyId: signingKey.id,
          client:
            clientAssets ?
              {
                entrypoints: clientAssets.entrypoints.map(
                  (name) => `client/${name}`
                ),
              }
            : undefined,
        },
        exports:
          mappedExports != null && typeof mappedExports === 'object' ?
            mappedExports
          : undefined,
      } satisfies ClarityPluginPackageJson,
      null,
      2
    )

    const addFileAndSignature = async (
      content: string | Buffer | Readable,
      {
        name,
      }: {
        name: string
      }
    ) => {
      if (!(content instanceof Readable) && isReadable(content)) {
        // archiver requires an instance of Readable, not something
        // duck type compatible with it
        archive.append(copyReadable(content), { name })
      } else {
        archive.append(content, { name })
      }
      const signature = new PassThrough()
      archive.append(signature, { name: `${name}.sig` })

      const environment = name.startsWith('client/') ? 'client' : 'server'
      const input = new PassThrough()
      input.write(
        JSON.stringify({
          plugin: packageJson.name,
          version: packageJson.version,
          environment,
          filename: name.replace(/^(client|server)\//, ''),
        })
      )
      if (isReadable(content)) content.pipe(input)
      else input.end(content)
      const signer = crypto.createSign('SHA256')
      await pipeline(input, signer)
      signature.end(signer.sign(signingKey.privateKey))
    }

    const url = new URL('/api/plugins/upload', clarityUrl)
    if (overwrite) url.searchParams.set('overwrite', 'true')

    if (hasServerTarball) {
      for await (const entry of fs
        .createReadStream(serverTarball)
        .pipe(createGunzip())
        .pipe(tar.extract())) {
        const { header } = entry
        const { name } = header
        if (name === 'package.json') continue
        switch (header.type) {
          case 'file':
            await addFileAndSignature(entry, { name })
            break
          case 'symlink':
            if (header.linkname) {
              archive.symlink(header.linkname, name)
            }
            break
        }
      }
    }

    const [uploadResponse] = await Promise.all([
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-tar',
          'Content-Encoding': 'gzip',
        },
        body: archive.pipe(createGzip()),
        duplex: 'half',
      }),
      addFileAndSignature(packageJsonStr, { name: 'package.json' }),
      ...(clientAssets && clientAssetsDir ?
        [...clientAssets.entrypoints, ...clientAssets.otherAssets].map((name) =>
          addFileAndSignature(
            fs.createReadStream(path.resolve(clientAssetsDir, name)),
            { name: `client/${name}` }
          )
        )
      : []),
      archive.finalize(),
    ])

    if (uploadResponse.ok) {
      // eslint-disable-next-line no-console
      console.error(
        `${chalk.greenBright('✔')} Deployed ${packageJson.name}@${packageJson.version}!`
      )
    } else {
      if (
        uploadResponse.headers
          .get('content-type')
          ?.startsWith('application/json')
      ) {
        const body = await uploadResponse.json()
        const parsed = ErrorResponseSchema.safeParse(body)
        if (parsed.success && parsed.data.code === 'API_ERROR_ALREADY_EXISTS') {
          const { overwrite } = await prompt({
            name: 'overwrite',
            type: 'confirm',
            initial: false,
            message: `⚠️ Plugin ${packageJson.name}@${packageJson.version} already exists.  Overwrite?`,
          })
          if (overwrite) await doUpload({ overwrite: true })
          return
        }
        // eslint-disable-next-line no-console
        console.error(body)
        return
      }
      // eslint-disable-next-line no-console
      console.error(
        `${chalk.redBright('✘')} Upload failed with status ${uploadResponse.status}`
      )
      // eslint-disable-next-line no-console
      console.error(
        await uploadResponse
          .text()
          .catch(() => '(failed to get error response text)')
      )
      return
    }

    if (isInteractive) {
      const activateUrl = new URL(
        `/superadmin/plugins/${encodeURIComponent(packageJson.name)}`,
        clarityUrl
      )

      // eslint-disable-next-line no-console
      console.error(dedent`

      You will need to activate this plugin version in Clarity (requires superadmin access).
      Press enter to open ${chalk.underline(activateUrl)} in your default browser.
      Then click on version ${chalk.bold(packageJson.version)} in the list that appears to open
      a dropdown menu, and click ${chalk.bold('Activate')} in the menu.

    `)

      if (await confirm(`Open ${activateUrl}?`, { initial: true })) {
        await open(activateUrl.toString(), { wait: false }).then((child) =>
          child.unref()
        )
      }
    }
  }
  await doUpload()
}
