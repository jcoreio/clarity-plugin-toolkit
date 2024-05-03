import Gitignore from 'gitignore-fs'
import path from 'path'
import { Glob } from 'glob'
import fs from 'fs-extra'
import { clientAssetsFile } from './constants'
import getProject from './getProject'

export default async function shouldBuild(): Promise<boolean> {
  const { projectDir } = await getProject()

  if (!(await fs.pathExists(path.resolve(projectDir, clientAssetsFile)))) {
    return true
  }
  const { mtime: assetsMtime } = await fs.stat(
    path.resolve(projectDir, clientAssetsFile)
  )

  const gitignore = new Gitignore()

  for await (const file of new Glob('**', {
    dot: true,
    ignore: {
      ignored: (path) => gitignore.ignoresSync(path.name),
      childrenIgnored: (path) =>
        gitignore.ignoresSync(path.name.replace(/\/$/, '/')),
    },
  })) {
    const { mtime } = await fs.stat(file)
    if (mtime > assetsMtime) return true
  }
  return false
}
