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
      const base64 = (
        await fs.readFile(path.resolve(projectDir, signingKeyFile), 'utf8')
      ).replace(/\s+/gm, '')
      const buffer = Buffer.from(base64, 'base64')
      return {
        id: buffer.readUint32BE(0),
        privateKey: crypto.createPrivateKey({
          key: buffer.subarray(4),
          type: 'pkcs8',
          format: 'der',
        }),
      }
    }
    throw new Error(`key generation flow not implemented yet`)
  }
)
