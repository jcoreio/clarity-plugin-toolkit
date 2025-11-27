import type * as yargs from 'yargs'

export const command = 'set-signing-key [key]'
export const description = `set the key for signing code`

export type Options = {
  key?: string
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.positional('key', {
    describe: 'the key to set. If omitted, will prompt you to paste the key',
    type: 'string',
    demandOption: false,
  })

export async function handler(
  options: yargs.Arguments<Options>
): Promise<void> {
  await (await import('./set-signing-key.lazy.ts')).handler(options)
}
