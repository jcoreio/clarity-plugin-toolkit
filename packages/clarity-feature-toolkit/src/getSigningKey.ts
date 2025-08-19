import { once } from 'lodash'
import path from 'path'
import fs from 'fs-extra'
import crypto from 'crypto'
import { signingKeyFile } from './constants'
import getProject from './getProject'
import prompt from 'prompts'
import { getClarityUrl } from './getClarityUrl'
import dedent from 'dedent-js'
import open from 'open'
import promptAndSetSigningKey from './promptAndSetSigningKey'

export const getSigningKey = once(
  async (): Promise<{ id: number; privateKey: crypto.KeyObject }> => {
    const { projectDir } = await getProject()
    const clarityUrl = await getClarityUrl()
    const signingUrl = new URL('login', clarityUrl)
    signingUrl.searchParams.set(
      'nextLocation',
      '/superadmin/signingKeys?create=true'
    )

    if (await fs.pathExists(path.resolve(projectDir, signingKeyFile))) {
      return parseSigningKey(
        await fs.readFile(path.resolve(projectDir, signingKeyFile), 'utf8')
      )
    }
    // eslint-disable-next-line no-console
    console.error(dedent`

      To deploy, you will need to create a signing key in Clarity.
      Press enter to open ${signingUrl} in your default browser;
      Once you have created and copied a signing key, come back here
      to paste it.

      Note: you need superadmin permission to create a signing key.
      If you don't have superadmin permission, you will need to have
      someone who does create the signing key for you.

    `)
    const { go } = await prompt({
      name: 'go',
      type: 'confirm',
      initial: true,
      message: `Open ${signingUrl}?`,
    })
    if (go) {
      await open(signingUrl.toString(), { wait: false }).then((child) =>
        child.unref()
      )
    }
    return await promptAndSetSigningKey()
  }
)

export function parseSigningKey(input: string | Buffer): {
  id: number
  privateKey: crypto.KeyObject
} {
  const buffer =
    typeof input === 'string' ?
      Buffer.from(input.replace(/\s+/gm, ''), 'base64')
    : input

  try {
    return {
      id: buffer.readUint32BE(0),
      privateKey: crypto.createPrivateKey({
        key: buffer.subarray(4),
        type: 'pkcs8',
        format: 'der',
      }),
    }
  } catch (error) {
    throw new Error(
      `invalid signing key: ${input}. ${error instanceof Error ? error.message : error}`
    )
  }
}
