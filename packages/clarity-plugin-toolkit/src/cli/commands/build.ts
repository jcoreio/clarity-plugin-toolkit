import type * as yargs from 'yargs'
import { defaultWebpackEnv } from '../../util/defaultWebpackEnv.ts'

export const command = 'build'
export const description = `transpile/bundle code for deployment`

export type Options = {
  env?: string[]
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 build').option('env', {
    type: 'string',
    array: true,
    default: defaultWebpackEnv,
  })

export async function handler(
  options: Partial<yargs.Arguments<Options>>
): Promise<void> {
  await (await import('./build.lazy.ts')).handler(options)
}
