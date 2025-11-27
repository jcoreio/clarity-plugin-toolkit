import type * as yargs from 'yargs'

export const command = 'clean'
export const description = `remove build output and temporary files`

type Options = {
  // empty for now
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 clean')

export async function handler(): Promise<void> {
  await (await import('./clean.lazy.ts')).handler()
}
