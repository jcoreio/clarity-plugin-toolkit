import type * as yargs from 'yargs'

export const command = 'dev'
export const description = `run plugin in local dev server`

export type Options = {}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 dev')

export async function handler(): Promise<void> {
  await (await import('./dev.lazy.ts')).handler()
}
