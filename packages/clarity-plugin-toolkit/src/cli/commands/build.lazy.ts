import type * as yargs from 'yargs'
import { buildClient } from '../../client/buildClient.ts'
import { buildServer } from '../../server/buildServer.ts'
import { getProjectBase } from '../../getProject.ts'
import path from 'path'
import fs from 'fs-extra'
import { makeDistPackageJson } from '../../server/makeDistPackageJson.ts'
import type { Options } from './build.ts'

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
