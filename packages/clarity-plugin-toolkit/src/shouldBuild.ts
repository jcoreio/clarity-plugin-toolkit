import Gitignore from 'gitignore-fs'
import { Glob } from 'glob'
import fs from 'fs-extra'
import getProject from './getProject.ts'
import isEqual from 'lodash/isEqual.js'
import path from 'path'

export default async function shouldBuild({
  env = [],
}: { env?: string[] } = {}): Promise<boolean> {
  const { clientAssetsFile, envFile } = await getProject()

  const previousEnv = await fs.readJson(envFile).catch(() => undefined)
  if (!isEqual(previousEnv, env)) {
    await fs.mkdirs(path.dirname(envFile))
    await fs.writeJson(envFile, env, { spaces: 2 })
    return true
  }

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
    stat: true,
    withFileTypes: true,
  })) {
    if (file.mtime && file.mtime.getTime() > assetsMtime) return true
  }
  return false
}
