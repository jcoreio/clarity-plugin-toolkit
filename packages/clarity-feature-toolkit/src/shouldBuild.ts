import Gitignore from 'gitignore-fs'
import path from 'path'
import { Glob } from 'glob'
import fs from 'fs-extra'
import { clientAssetsFile, serverAssetsFile } from './constants'
import getProject from './getProject'

export default async function shouldBuild(): Promise<boolean> {
  const { projectDir } = await getProject()

  let assetsMtime = -Infinity
  for (const file of [
    path.resolve(projectDir, clientAssetsFile),
    path.resolve(projectDir, serverAssetsFile),
  ]) {
    if (await fs.pathExists(file)) {
      const { mtime } = await fs.stat(file)
      assetsMtime = Math.max(assetsMtime, mtime.getTime())
    }
  }
  if (!Number.isFinite(assetsMtime)) return true

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
    if (mtime.getTime() > assetsMtime) return true
  }
  return false
}
