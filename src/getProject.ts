import findUp from 'find-up'
import path from 'path'
import fs from 'fs-extra'
import { once } from 'lodash'
import z from 'zod'
import { PackageJsonSchema } from './PackageJsonSchema'
import dedent from 'dedent-js'
import stringifyPath from './stringifyPath'

const getProject = once(
  async (): Promise<{
    projectDir: string
    packageJsonFile: string
    packageJson: z.output<typeof PackageJsonSchema>
  }> => {
    const packageJsonFile = await findUp('package.json', { type: 'file' })
    if (!packageJsonFile) {
      throw new Error(`failed to find project package.json file`)
    }
    const projectDir = path.dirname(packageJsonFile)
    const packageJson = await fs.readJson(packageJsonFile)

    try {
      PackageJsonSchema.parse(packageJson)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const { issues } = error
        throw Object.assign(
          new Error(
            dedent`
              ${path.relative(
                process.cwd(),
                packageJsonFile
              )} is invalid for building a Clarity feature
              Issues:
                ${issues
                  .map(
                    ({ message, path }) =>
                      `- ${message} (at ${stringifyPath(path)})`
                  )
                  .join('\n  ')}
            `
          ),
          { issues }
        )
      }
      throw new Error(
        `Invalid clarity feature package.json: ${path.relative(
          process.cwd(),
          packageJsonFile
        )}`
      )
    }

    return { projectDir, packageJsonFile, packageJson }
  }
)

export default getProject
