import fs from 'fs-extra'
import path from 'path'

type Symlink = {
  target: string
  mode: number
}
type Packlist = {
  files: Set<string>
  symlinks: Map<string, Symlink>
}
export async function makePacklist({
  projectDir,
  dependencies,
}: {
  projectDir: string
  dependencies: string[]
}): Promise<Packlist> {
  const files: Set<string> = new Set()
  const symlinks: Map<string, Symlink> = new Map()

  const dirs: Set<string> = new Set()

  await Promise.all(dependencies.map((dep) => addDep(dep, projectDir)))

  async function addFiles(p: string): Promise<void> {
    const stat = await fs.lstat(p)
    if (stat.isFile()) {
      files.add(path.relative(projectDir, p))
    } else if (stat.isDirectory()) {
      const entries = await fs.readdir(p)
      await Promise.all(entries.map((e) => addFiles(path.join(p, e))))
    } else if (stat.isSymbolicLink()) {
      const realpath = path.resolve(path.dirname(p), await fs.readlink(p))
      symlinks.set(path.relative(projectDir, p), {
        target: path.relative(path.dirname(p), realpath),
        mode: stat.mode,
      })
      await addFiles(realpath)
    }
  }

  async function findDepDir(
    dep: string,
    basedir: string,
    origBasedir = basedir
  ): Promise<string> {
    const deppath = path.resolve(basedir, 'node_modules', dep)
    if (await fs.pathExists(deppath)) return deppath
    if (basedir === projectDir) {
      throw new Error(`failed to resolve dependency ${dep} in ${origBasedir}`)
    }
    let parentDir = path.dirname(basedir)
    if (path.basename(parentDir) === 'node_modules') {
      parentDir = path.dirname(parentDir)
    }
    return await findDepDir(dep, parentDir, origBasedir)
  }

  async function addDep(dep: string, basedir: string): Promise<void> {
    let deppath = await findDepDir(dep, basedir)
    let stat = await fs.lstat(deppath)
    while (stat.isSymbolicLink()) {
      const relpath = path.relative(projectDir, deppath)
      if (symlinks.has(relpath)) return
      const from = path.dirname(deppath)
      deppath = path.resolve(path.dirname(deppath), await fs.readlink(deppath))
      symlinks.set(relpath, {
        target: path.relative(from, deppath),
        mode: stat.mode,
      })
      stat = await fs.lstat(deppath)
    }
    const relpath = path.relative(projectDir, deppath)
    if (dirs.has(relpath)) return
    dirs.add(relpath)
    await addFiles(deppath)
    const packageJson = await fs.readJson(path.join(deppath, 'package.json'))
    const { dependencies } = packageJson
    if (dependencies) {
      await Promise.all(
        Object.keys(dependencies).map((dep) => addDep(dep, deppath))
      )
    }
  }

  return { files, symlinks }
}
export function toPosix(file: string) {
  return process.platform === 'win32' ? file.replaceAll('\\', '/') : file
}
