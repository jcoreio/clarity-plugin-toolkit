import * as yargs from 'yargs'
import { buildClient } from '../../client/buildClient'
import { buildServer } from '../../server/buildServer'

export const command = 'build'
export const description = `build bundles for deployment`

type Options = {
  env?: string[]
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 build').option('env', {
    type: 'string',
    array: true,
    default: ['development'],
  })

export async function handler({
  env,
}: Partial<yargs.Arguments<Options>>): Promise<void> {
  await buildClient({ args: env?.flatMap((v) => ['--env', v]) })
  await buildServer()
}
