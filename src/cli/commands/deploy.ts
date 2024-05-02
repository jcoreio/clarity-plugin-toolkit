// eslint-disable-next-line @typescript-eslint/no-unused-vars
import yargs from 'yargs'
import { getClarityUrl } from '../../getClarityUrl'
import { getClarityApiToken } from '../../getClarityApiToken'
import findUp from 'find-up'
import path from 'path'
import fs from 'fs-extra'
import archiver from 'archiver'
import { createGzip } from 'zlib'
import { clientAssetsFile } from '../../constants'
import { AssetsSchema } from '../../AssetsSchema'
import z from 'zod'
import prompt from 'prompts'

export const command = 'deploy'
export const description = `deploy to Clarity`

type Options = {
  // empty for now
}

const ErrorResponseSchema = z.object({
  code: z.string(),
})

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 deploy')

export async function handler(): Promise<void> {
  const packageJsonFile = await findUp('package.json', { type: 'file' })
  if (!packageJsonFile) {
    throw new Error(`failed to find project package.json file`)
  }
  const packageJson = await fs.readJson(packageJsonFile)

  const projectDir = path.dirname(packageJsonFile)

  const clarityUrl = await getClarityUrl()
  const token = await getClarityApiToken()

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

    archive.append(
      JSON.stringify(
        {
          ...packageJson,
          client: {
            entrypoints: clientAssets.entrypoints.map(
              (name) => `client/${name}`
            ),
          },
        },
        null,
        2
      ),
      {
        name: 'package.json',
      }
    )
    for (const name of [
      ...clientAssets.entrypoints,
      ...clientAssets.otherAssets,
    ]) {
      archive.append(fs.createReadStream(path.resolve(clientAssetsDir, name)), {
        name: `client/${name}`,
      })
    }
    const url = new URL('/api/customFeatures/upload', clarityUrl)
    if (overwrite) url.searchParams.set('overwrite', 'true')

    const [uploadResponse] = await Promise.all([
      fetch(url, {
        headers: {
          Authorization: `bearer ${token}`,
          'Content-Type': 'application/x-tar',
          'Content-Encoding': 'gzip',
        },
        method: 'POST',
        body: archive.pipe(createGzip()),
        duplex: 'half',
      }),
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
