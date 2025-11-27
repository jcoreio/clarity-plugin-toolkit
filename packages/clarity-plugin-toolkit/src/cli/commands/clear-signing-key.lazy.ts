import getProject from '../../getProject.ts'
import fs from 'fs-extra'

export async function handler(): Promise<void> {
  const { signingKeyFile } = await getProject()
  if (await fs.pathExists(signingKeyFile)) {
    await fs.remove(signingKeyFile)
    // eslint-disable-next-line no-console
    console.error(`deleted signing key`)
  }
}
