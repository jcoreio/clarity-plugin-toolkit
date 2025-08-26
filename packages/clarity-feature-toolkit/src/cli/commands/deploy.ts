import * as yargs from 'yargs'
import { getClarityUrl } from '../../getClarityUrl'
import path from 'path'
import fs from 'fs-extra'
import archiver from 'archiver'
import { createGzip } from 'zlib'
import { clientAssetsFile, serverAssetsFile } from '../../constants'
import { AssetsSchema } from '../../AssetsSchema'
import z from 'zod'
import prompt from 'prompts'
import getProject from '../../getProject'
import crypto from 'crypto'
import * as build from './build'
import shouldBuild from '../../shouldBuild'
import { getSigningKey } from '../../getSigningKey'
import { pipeline } from 'stream/promises'
import { PassThrough, Readable } from 'stream'

export const command = 'deploy'
export const description = `build (if necessary) and deploy to Clarity`

type Options = {
  // empty for now
}

const ErrorResponseSchema = z.object({
  code: z.string(),
})

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 deploy')

export async function handler(): Promise<void> {
  const { projectDir, packageJson } = await getProject()
  if (await shouldBuild()) await build.handler()

  const clarityUrl = await getClarityUrl()
  const signingKey = await getSigningKey()

  // eslint-disable-next-line no-console
  console.error(
    `Deploying ${packageJson.name}@${packageJson.version} to ${clarityUrl}...`
  )

  const doUpload = async ({
    overwrite,
  }: { overwrite?: boolean } = {}): Promise<void> => {
    const archive = archiver('tar')
    const clientAssets = AssetsSchema.parse(
      await fs.readJson(path.resolve(projectDir, clientAssetsFile))
    )
    const clientAssetsDir = path.resolve(
      path.dirname(path.resolve(projectDir, clientAssetsFile)),
      clientAssets.outputPath
    )
    const serverAssets = AssetsSchema.parse(
      await fs.readJson(path.resolve(projectDir, serverAssetsFile))
    )
    const serverAssetsDir = path.resolve(
      path.dirname(path.resolve(projectDir, serverAssetsFile)),
      serverAssets.outputPath
    )

    const packageJsonStr = JSON.stringify(
      {
        ...packageJson,
        clarity: {
          signatureVerificationKeyId: signingKey.id,
        },
        client: {
          entrypoints: clientAssets.entrypoints.map((name) => `client/${name}`),
        },
        server: {
          entrypoints: serverAssets.entrypoints.map((name) => `server/${name}`),
        },
      },
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
      archive.append(content, { name })
      const signature = new PassThrough()
      archive.append(signature, { name: `${name}.sig` })

      const environment = name.startsWith('client/') ? 'client' : 'server'
      const input = new PassThrough()
      input.write(
        JSON.stringify({
          feature: packageJson.name,
          version: packageJson.version,
          environment,
          filename: name.replace(/^(client|server)\//, ''),
        })
      )
      if (content instanceof Readable) content.pipe(input)
      else input.end(content)
      const signer = crypto.createSign('SHA256')
      await pipeline(input, signer)
      signature.end(signer.sign(signingKey.privateKey))
    }

    const url = new URL('/api/customFeatures/upload', clarityUrl)
    if (overwrite) url.searchParams.set('overwrite', 'true')

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
      ...[...clientAssets.entrypoints, ...clientAssets.otherAssets].map(
        (name) =>
          addFileAndSignature(
            fs.createReadStream(path.resolve(clientAssetsDir, name)),
            { name: `client/${name}` }
          )
      ),
      ...[...serverAssets.entrypoints, ...serverAssets.otherAssets].map(
        (name) =>
          addFileAndSignature(
            fs.createReadStream(path.resolve(serverAssetsDir, name)),
            { name: `server/${name}` }
          )
      ),
      archive.finalize(),
    ])

    if (uploadResponse.ok) {
      // eslint-disable-next-line no-console
      console.error(`Deployed ${packageJson.name}@${packageJson.version}!`)
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
            message: `Feature ${packageJson.name}@${packageJson.version} already exists.  Overwrite?`,
          })
          if (overwrite) await doUpload({ overwrite: true })
          return
        }
        // eslint-disable-next-line no-console
        console.error(body)
        return
      }
      const body = await uploadResponse.text()
      // eslint-disable-next-line no-console
      console.error(body)
    }
  }
  await doUpload()
}
