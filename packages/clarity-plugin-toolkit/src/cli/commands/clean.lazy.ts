import path from 'path'
import getProject from '../../getProject.ts'
import fs from 'fs-extra'

export async function handler(): Promise<void> {
  const { projectDir, distDir, clientAssetsFile, emptyEntryFile } =
    await getProject()
  await Promise.all(
    [distDir, clientAssetsFile, emptyEntryFile].map(async (p) =>
      fs.remove(path.resolve(projectDir, p))
    )
  )
}
