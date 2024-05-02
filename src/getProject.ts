import findUp from 'find-up'
import path from 'path'
import fs from 'fs-extra'
import { once } from 'lodash'

const getProject = once(
  async (): Promise<{
    projectDir: string
    packageJsonFile: string
    packageJson: Record<string, any>
  }> => {
    const packageJsonFile = await findUp('package.json', { type: 'file' })
    if (!packageJsonFile) {
      throw new Error(`failed to find project package.json file`)
    }
    const projectDir = path.dirname(packageJsonFile)
    const packageJson = await fs.readJson(packageJsonFile)
    return { projectDir, packageJsonFile, packageJson }
  }
)

export default getProject
