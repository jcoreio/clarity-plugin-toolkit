import { once } from 'lodash'
import path from 'path'
import fs from 'fs-extra'
import crypto from 'crypto'
import { signingKeyFile } from './constants'
import getProject from './getProject'

export const getSigningKey = once(
  async (): Promise<{ id: number; privateKey: crypto.KeyObject }> => {
    const { projectDir } = await getProject()

    if (await fs.pathExists(path.resolve(projectDir, signingKeyFile))) {
      return parseSigningKey(
        await fs.readFile(path.resolve(projectDir, signingKeyFile), 'utf8')
      )
    }
    throw new Error(`key generation flow not implemented yet`)
  }
)

export function parseSigningKey(input: string | Buffer): {
  id: number
  privateKey: crypto.KeyObject
} {
  const buffer =
    typeof input === 'string'
      ? Buffer.from(input.replace(/\s+/gm, ''), 'base64')
      : input
  return {
    id: buffer.readUint32BE(0),
    privateKey: crypto.createPrivateKey({
      key: buffer.subarray(4),
      type: 'pkcs8',
      format: 'der',
    }),
  }
}
