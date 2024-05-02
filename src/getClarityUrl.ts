import fs from 'fs-extra'
import { once } from 'lodash'
import path from 'path'
import prompt from 'prompts'
import getProject from './getProject'

export const getClarityUrl = once(async (): Promise<string> => {
  const { packageJsonFile, packageJson } = await getProject()

  if (!packageJson.clarity?.url) {
    const { clarityUrl } = await prompt({
      name: 'clarityUrl',
      type: 'text',
      message: 'Enter the Base URL of your Clarity deployment:',
      validate: (text) => {
        try {
          new URL(text)
          return true
        } catch (error) {
          return 'invalid URL'
        }
      },
    })
    packageJson.clarity = packageJson.clarity || {}
    packageJson.clarity.url = clarityUrl
    await fs.writeJson(packageJsonFile, packageJson, { spaces: 2 })
    // eslint-disable-next-line no-console
    console.error(`wrote ${path.relative(process.cwd(), packageJsonFile)}`)
  }
  return packageJson.clarity.url
})
