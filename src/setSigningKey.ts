import getProject from './getProject'
import prompt from 'prompts'
import path from 'path'
import fs from 'fs-extra'
import crypto from 'crypto'
import { signingKeyFile } from './constants'
import { parseSigningKey } from './getSigningKey'

export default async function setSigningKey(): Promise<{
  id: number
  privateKey: crypto.KeyObject
}> {
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
  const parsed = parseSigningKey(key)
  await fs.writeFile(path.resolve(projectDir, signingKeyFile), key, 'utf8')
  // eslint-disable-next-line no-console
  console.error(`saved signing key`)
  return parsed
}
