import getProject from './getProject.ts'
import path from 'path'
import fs from 'fs-extra'
import crypto from 'crypto'
import { parseSigningKey } from './getSigningKey.ts'

export default async function setSigningKey(key: string): Promise<{
  id: number
  privateKey: crypto.KeyObject
}> {
  const { signingKeyFile } = await getProject()
  const parsed = parseSigningKey(key)
  await fs.mkdirs(path.dirname(signingKeyFile))
  await fs.writeFile(signingKeyFile, key, 'utf8')
  // eslint-disable-next-line no-console
  console.error(`saved signing key`)
  return parsed
}
