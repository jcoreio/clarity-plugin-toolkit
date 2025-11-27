import type * as yargs from 'yargs'
import setSigningKey from '../../setSigningKey.ts'
import promptAndSetSigningKey from '../../promptAndSetSigningKey.ts'
import type { Options } from './set-signing-key.ts'

export async function handler({
  key,
}: yargs.Arguments<Options>): Promise<void> {
  if (key) await setSigningKey(key)
  else await promptAndSetSigningKey()
}
