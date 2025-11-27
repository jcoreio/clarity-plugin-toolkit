import type * as yargs from 'yargs'

export const command = 'clear-signing-key'
export const description = `delete the local copy of the key for signing code`

type Options = {
  // empty for now
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 clear-signing-key')

export async function handler(): Promise<void> {
  await (await import('./clear-signing-key.lazy.ts')).handler()
}
