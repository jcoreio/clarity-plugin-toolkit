import type * as yargs from 'yargs'

export const command = 'pack'
export const description = `pack code into a tarball for deployment`

type Options = {}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 pack')

export async function handler(): Promise<void> {
  await (await import('./pack.lazy.ts')).handler()
}
