import fs from 'fs-extra'
import once from 'lodash/once.js'
import path from 'path'
import prompt from 'prompts'
import getProject from './getProject.ts'

export const getClarityUrl = once(async (): Promise<string> => {
  const { packageJsonFile, packageJson } = await getProject()

  const existingUrl = packageJson.clarity?.url
  if (existingUrl) return existingUrl

  const { clarityUrl } = await prompt({
    name: 'clarityUrl',
    type: 'text',
    message: 'Enter the Base URL of your Clarity deployment:',
    validate: (text) => {
      try {
        new URL(text)
        return true
      } catch {
        return 'invalid URL'
      }
    },
  })
  packageJson.clarity = packageJson.clarity || {}
  packageJson.clarity.url = clarityUrl
  await fs.writeJson(packageJsonFile, packageJson, { spaces: 2 })
  // eslint-disable-next-line no-console
  console.error(`wrote ${path.relative(process.cwd(), packageJsonFile)}`)
  return clarityUrl
})
