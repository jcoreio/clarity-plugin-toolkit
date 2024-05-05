// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as yargs from 'yargs'
import getProject from '../../getProject'
import path from 'path'
import fs from 'fs-extra'
import { signingKeyFile } from '../../constants'

export const command = 'clear-signing-key'
export const description = `delete the local copy of the key for signing code`

type Options = {
  // empty for now
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 clear-signing-key')

export async function handler(): Promise<void> {
  const { projectDir } = await getProject()
  if (await fs.pathExists(path.resolve(projectDir, signingKeyFile))) {
    await fs.remove(path.resolve(projectDir, signingKeyFile))
    // eslint-disable-next-line no-console
    console.error(`deleted signing key`)
  }
}
