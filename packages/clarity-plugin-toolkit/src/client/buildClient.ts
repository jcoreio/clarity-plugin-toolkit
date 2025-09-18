import execa from 'execa'
import getProject from '../getProject'

export async function buildClient() {
  const { projectDir, packageJson } = await getProject()
  if (!packageJson.clarity?.client) return
  await execa('npm', ['exec', 'webpack'], { stdio: 'inherit', cwd: projectDir })
}
