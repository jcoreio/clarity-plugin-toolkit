import Gitignore from 'gitignore-fs'
import { Glob } from 'glob'
import fs from 'fs-extra'
import getProject from './getProject'

export default async function shouldBuild(): Promise<boolean> {
  const { clientAssetsFile } = await getProject()

  let assetsMtime = -Infinity
  for (const file of [clientAssetsFile]) {
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
