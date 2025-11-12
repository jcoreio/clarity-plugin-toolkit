import findUp from 'find-up'
import path from 'path'
import fs from 'fs-extra'
import once from 'lodash/once.js'
import z from 'zod'
import { PackageJsonSchema } from './PackageJsonSchema.ts'
import dedent from 'dedent-js'
import stringifyPath from './stringifyPath.ts'
import { paths } from './paths.ts'

export async function getProjectBase(cwd = process.cwd()): Promise<
  {
    projectDir: string
    packageJsonFile: string
    packageJson: z.output<typeof PackageJsonSchema>
    distTarball: string
    devOutDir: string
    devOutClientDir: string
  } & ReturnType<typeof paths>
> {
  const packageJsonFile = await findUp('package.json', { type: 'file', cwd })
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
                cwd,
                packageJsonFile
              )} is invalid for building a Clarity plugin
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
      `Invalid clarity plugin package.json: ${path.relative(
        cwd,
        packageJsonFile
      )}`
    )
  }

  const pathsProps = paths(projectDir)

  return {
    projectDir,
    packageJsonFile,
    packageJson,
    ...pathsProps,
    distTarball: path.join(
      pathsProps.distDir,
      `${packageJson.name.replace(/^@/, '').replace(/\//g, '-')}-${packageJson.version}.tgz`
    ),
    devOutDir: path.join(
      pathsProps.devDir,
      packageJson.name,
      packageJson.version
    ),
    devOutClientDir: path.join(
      pathsProps.devDir,
      packageJson.name,
      packageJson.version,
      'client'
    ),
  }
}

const getProject = once(() => getProjectBase())

export default getProject
