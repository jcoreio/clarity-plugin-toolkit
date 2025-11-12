import * as yargs from 'yargs'
import { buildClient } from '../../client/buildClient.ts'
import { buildServer } from '../../server/buildServer.ts'
import { getProjectBase } from '../../getProject.ts'
import path from 'path'
import fs from 'fs-extra'
import { defaultWebpackEnv } from '../../util/defaultWebapckEnv.ts'
import { makeDistPackageJson } from '../../server/makeDistPackageJson.ts'

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
  const { distPackageJsonFile } = await getProjectBase(process.cwd())
  await buildClient({ args: env?.flatMap((v) => ['--env', v]) })
  await buildServer()

  const distPackageJson = await makeDistPackageJson()

  await fs.mkdirs(path.dirname(distPackageJsonFile))
  await fs.writeJson(distPackageJsonFile, distPackageJson, { spaces: 2 })
  // eslint-disable-next-line no-console
  console.error(`wrote ${path.relative(process.cwd(), distPackageJsonFile)}`)
}
