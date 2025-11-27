import type * as yargs from 'yargs'
import { defaultWebpackEnv } from '../../util/defaultWebapckEnv.ts'

export const command = 'deploy'
export const description = `build (if necessary) and deploy to Clarity`

export type Options = {
  env?: string[]
  overwrite?: boolean
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs
    .usage('$0 deploy')
    .option('env', {
      type: 'string',
      array: true,
      default: defaultWebpackEnv,
    })
    .option('overwrite', {
      type: 'boolean',
      default: false,
    })

export async function handler(
  options: yargs.Arguments<Options>
): Promise<void> {
  await (await import('./deploy.lazy.ts')).handler(options)
}
