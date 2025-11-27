import type * as yargs from 'yargs'
import getProject from '../../getProject.ts'
import fs from 'fs-extra'

export const command = 'clear-signing-key'
export const description = `delete the local copy of the key for signing code`

type Options = {
  // empty for now
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 clear-signing-key')

export async function handler(): Promise<void> {
  const { signingKeyFile } = await getProject()
  if (await fs.pathExists(signingKeyFile)) {
    await fs.remove(signingKeyFile)
    // eslint-disable-next-line no-console
    console.error(`deleted signing key`)
  }
}
