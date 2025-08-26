import * as yargs from 'yargs'
import { buildClient } from '../../client/buildClient'
import { buildServer } from '../../server/buildServer'

export const command = 'build'
export const description = `build bundles for deployment`

type Options = {
  // empty for now
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 build')

export async function handler(): Promise<void> {
  await buildClient()
  await buildServer()
}
