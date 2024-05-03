// eslint-disable-next-line @typescript-eslint/no-unused-vars
import yargs from 'yargs'
import setSigningKey from '../../setSigningKey'
import { getSigningKey } from '../../getSigningKey'
import fs from 'fs-extra'
import path from 'path'
import getProject from '../../getProject'
import { signingKeyFile } from '../../constants'

export const command = 'set-signing-key'
export const description = `set the key for signing code`

type Options = {
  // empty for now
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 set-signing-key')

export async function handler(): Promise<void> {
  const { projectDir } = await getProject()
  if (await fs.pathExists(path.resolve(projectDir, signingKeyFile))) {
    await setSigningKey()
  } else {
    await getSigningKey()
  }
}
