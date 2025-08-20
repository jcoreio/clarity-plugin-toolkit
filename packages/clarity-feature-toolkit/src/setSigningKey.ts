import getProject from './getProject'
import path from 'path'
import fs from 'fs-extra'
import crypto from 'crypto'
import { signingKeyFile } from './constants'
import { parseSigningKey } from './getSigningKey'

export default async function setSigningKey(key: string): Promise<{
  id: number
  privateKey: crypto.KeyObject
}> {
  const { projectDir } = await getProject()
  const parsed = parseSigningKey(key)
  await fs.mkdirs(path.dirname(path.resolve(projectDir, signingKeyFile)))
  await fs.writeFile(path.resolve(projectDir, signingKeyFile), key, 'utf8')
  // eslint-disable-next-line no-console
  console.error(`saved signing key`)
  return parsed
}
