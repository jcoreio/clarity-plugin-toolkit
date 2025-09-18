import execa from 'execa'
import getProject from '../getProject'

export async function buildClient(options?: { args?: string[] }) {
  const { projectDir, packageJson } = await getProject()
  if (!packageJson.clarity?.client) return
  await execa('npm', ['exec', 'webpack', '--', ...(options?.args || [])], {
    stdio: 'inherit',
    cwd: projectDir,
  })
}
