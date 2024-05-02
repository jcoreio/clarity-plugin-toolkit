import { once } from 'lodash'
import { getClarityUrl } from './getClarityUrl'
import path from 'path'
import fs from 'fs-extra'
import prompt from 'prompts'
import z from 'zod'
import { clarityApiTokenFile } from './constants'
import getProject from './getProject'

const required = (s: string | undefined) => (s?.trim() ? true : 'required')

export const getClarityApiToken = once(async (): Promise<string> => {
  const clarityUrl = await getClarityUrl()
  const { projectDir } = await getProject()

  if (await fs.pathExists(path.resolve(projectDir, clarityApiTokenFile))) {
    const token = (
      await fs.readFile(path.resolve(projectDir, clarityApiTokenFile), 'utf8')
    ).trim()
    const loginResponse = await fetch(new URL('/login', clarityUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
      }),
    })
    if (loginResponse.ok) return token
  }
  const { username, password } = await prompt([
    {
      type: 'text',
      name: 'username',
      message: 'Username:',
      validate: required,
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
      validate: required,
    },
  ])
  const loginResponse = await fetch(new URL('/login', clarityUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })
  if (!loginResponse.ok) {
    const body: any = await loginResponse.json()
    throw new Error(body.error || String(body))
  }
  const { token } = z
    .object({ token: z.string() })
    .parse(await loginResponse.json())

  await fs.writeFile(
    path.resolve(projectDir, clarityApiTokenFile),
    token,
    'utf8'
  )
  return token
})
