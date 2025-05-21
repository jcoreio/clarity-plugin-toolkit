import * as yargs from 'yargs'
import path from 'path'
import {
  clientAssetsFile,
  clientEntrypointFile,
  distDir,
  emptyEntryFile,
} from '../../constants'
import getProject from '../../getProject'
import fs from 'fs-extra'

export const command = 'clean'
export const description = `remove build output and temporary files`

type Options = {
  // empty for now
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 clean')

export async function handler(): Promise<void> {
  const { projectDir } = await getProject()
  await Promise.all(
    [distDir, clientAssetsFile, clientEntrypointFile, emptyEntryFile].map(
      async (p) => fs.remove(path.resolve(projectDir, p))
    )
  )
}
