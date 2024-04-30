// eslint-disable-next-line @typescript-eslint/no-unused-vars
import findUp from 'find-up'
import fs from 'fs-extra'
import { once } from 'lodash'
import path from 'path'
import prompt from 'prompts'

export const getClarityUrl = once(async (): Promise<string> => {
  const packageJsonFile = await findUp('package.json', { type: 'file' })
  if (!packageJsonFile) {
    throw new Error(`failed to find project package.json file`)
  }
  const packageJson = await fs.readJson(packageJsonFile)

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
