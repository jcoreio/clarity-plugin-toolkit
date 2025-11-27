import type * as yargs from 'yargs'
import setSigningKey from '../../setSigningKey.ts'
import promptAndSetSigningKey from '../../promptAndSetSigningKey.ts'

export const command = 'set-signing-key [key]'
export const description = `set the key for signing code`

type Options = {
  key?: string
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.positional('key', {
    describe: 'the key to set. If omitted, will prompt you to paste the key',
    type: 'string',
    demandOption: false,
  })

export async function handler({
  key,
}: yargs.Arguments<Options>): Promise<void> {
  if (key) await setSigningKey(key)
  else await promptAndSetSigningKey()
}
