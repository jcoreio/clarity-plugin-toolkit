import * as yargs from 'yargs'
import path from 'path'
import getProject from '../../getProject.ts'
import fs from 'fs-extra'

export const command = 'clean'
export const description = `remove build output and temporary files`

type Options = {
  // empty for now
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 clean')

export async function handler(): Promise<void> {
  const { projectDir, distDir, clientAssetsFile, emptyEntryFile } =
    await getProject()
  await Promise.all(
    [distDir, clientAssetsFile, emptyEntryFile].map(async (p) =>
      fs.remove(path.resolve(projectDir, p))
    )
  )
}
