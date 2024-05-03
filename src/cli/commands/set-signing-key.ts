// eslint-disable-next-line @typescript-eslint/no-unused-vars
import yargs from 'yargs'
import getProject from '../../getProject'
import prompt from 'prompts'
import path from 'path'
import fs from 'fs-extra'
import { signingKeyFile } from '../../constants'
import { parseSigningKey } from '../../getSigningKey'

export const command = 'set-signing-key'
export const description = `set the key for signing code`

type Options = {
  // empty for now
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 set-signing-key')

export async function handler(): Promise<void> {
  const { projectDir } = await getProject()
  const { key } = await prompt({
    name: 'key',
    type: 'password',
    message: 'Paste signing key:',
    validate: (value: any) => {
      if (typeof value !== 'string') return 'is required'
      try {
        parseSigningKey(value)
      } catch (error) {
        return 'invalid signing key'
      }
      return true
    },
  })
  await fs.writeFile(path.resolve(projectDir, signingKeyFile), key, 'utf8')
  // eslint-disable-next-line no-console
  console.error(`saved signing key`)
}
