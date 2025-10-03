import execa from 'execa'
import getProject from '../getProject'
import { getPackageManager } from '../util/getPackageManager'

export async function buildClient(options?: { args?: string[] }) {
  const { projectDir, packageJson } = await getProject()
  if (!packageJson.clarity?.client) return
  await execa(
    await getPackageManager(),
    ['exec', 'webpack', '--', ...(options?.args || [])],
    {
      stdio: 'inherit',
      cwd: projectDir,
    }
  )
}
