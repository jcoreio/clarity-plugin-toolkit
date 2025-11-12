import cloneDeep from 'lodash/cloneDeep.js'
import { getProjectBase } from '../getProject.ts'
import { AssetsSchema } from '../client/AssetsSchema.ts'
import fs from 'fs-extra'
import semver from 'semver'
import path from 'path'
import { mapExports } from '../util/mapExports.ts'

export async function makeDistPackageJson({
  cwd = process.cwd(),
}: { cwd?: string } = {}) {
  const { projectDir, packageJson, clientAssetsFile } =
    await getProjectBase(cwd)
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

  return distPackageJson
}
