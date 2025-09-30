import * as yargs from 'yargs'
import { buildClient } from '../../client/buildClient'
import { buildServer } from '../../server/buildServer'
import semver from 'semver'
import { mapExports } from '../../util/mapExports'
import { getProjectBase } from '../../getProject'
import { cloneDeep } from 'lodash'
import path from 'path'
import fs from 'fs-extra'
import { AssetsSchema } from '../../client/AssetsSchema'
import { defaultWebpackEnv } from '../../util/defaultWebapckEnv'

export const command = 'build'
export const description = `transpile/bundle code for deployment`

type Options = {
  env?: string[]
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 build').option('env', {
    type: 'string',
    array: true,
    default: defaultWebpackEnv,
  })

export async function handler({
  env,
}: Partial<yargs.Arguments<Options>>): Promise<void> {
  const { projectDir, packageJson, clientAssetsFile, distPackageJsonFile } =
    await getProjectBase(process.cwd())
  await buildClient({ args: env?.flatMap((v) => ['--env', v]) })
  await buildServer()

  const distPackageJson = cloneDeep(packageJson)

  // declare a valid semver range for @jcoreio/clarity-plugin-api in the deployed package.json
  // so that Clarity can tell whether it's compatible
  if (
    distPackageJson.dependencies['@jcoreio/clarity-plugin-api'] &&
    !semver.validRange(
      distPackageJson.dependencies['@jcoreio/clarity-plugin-api']
    )
  ) {
    distPackageJson.dependencies['@jcoreio/clarity-plugin-api'] =
      `^${(await fs.readJson(path.join(projectDir, 'node_modules', '@jcoreio', 'clarity-plugin-api', 'package.json'))).version}`
  }

  const mappedExports = mapExports(distPackageJson.exports, (file) =>
    file.replace(/\.([cm])?[jt]sx?$/, '.$1js')
  )

  const clientAssets =
    (await fs.pathExists(clientAssetsFile)) ?
      AssetsSchema.parse(await fs.readJson(clientAssetsFile))
    : undefined
  distPackageJson.clarity = {
    ...distPackageJson.clarity,
    client:
      clientAssets ?
        {
          entrypoints: clientAssets.entrypoints.map((name) => `client/${name}`),
        }
      : undefined,
  }

  distPackageJson.exports =
    mappedExports != null && typeof mappedExports === 'object' ?
      mappedExports
    : undefined

  await fs.writeJson(distPackageJsonFile, distPackageJson, { spaces: 2 })
  // eslint-disable-next-line no-console
  console.error(`wrote ${path.relative(process.cwd(), distPackageJsonFile)}`)
}
