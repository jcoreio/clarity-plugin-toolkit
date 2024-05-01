// eslint-disable-next-line @typescript-eslint/no-unused-vars
import yargs from 'yargs'
import { getClarityUrl } from '../../getClarityUrl'
import { getClarityApiToken } from '../../getClarityApiToken'
import findUp from 'find-up'
import path from 'path'
import fs from 'fs-extra'
import archiver from 'archiver'
import { createGzip } from 'zlib'
import { customFeatureAssetRoute } from '@jcoreio/clarity-feature-api'

export const command = 'deploy'
export const description = `deploy to Clarity`

type Options = {
  // empty for now
}

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

  const archive = archiver('tar')
  const assets = await fs.readJson(
    path.resolve(projectDir, 'dist', 'client', 'assets.json')
  )

  archive.append(fs.createReadStream(packageJsonFile), { name: 'package.json' })
  for (const asset of [
    ...Object.values(assets[packageJson.name] || {}),
    ...Object.values(assets[''] || {}),
  ].flat() as string[]) {
    const name = asset.startsWith(
      customFeatureAssetRoute.format({ filename: '' })
    )
      ? asset.substring(customFeatureAssetRoute.format({ filename: '' }).length)
      : asset
    archive.append(
      fs.createReadStream(path.resolve(projectDir, 'dist', 'client', name)),
      { name }
    )
  }

  const [uploadResponse] = await Promise.all([
    fetch(new URL('/api/customFeatures/upload', clarityUrl), {
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
  if (!uploadResponse.ok) {
    const body = await uploadResponse.text()
    // eslint-disable-next-line no-console
    console.error(body)
  }
}
