import execa from 'execa'
import getProject from '../getProject.ts'
import { getPackageManager } from '../util/getPackageManager.ts'
import { isInteractive } from '../util/isInteractive.ts'

export async function buildClient(options?: { args?: string[] }) {
  const { projectDir, packageJson } = await getProject()
  if (!packageJson.clarity?.client) return
  await execa(
    await getPackageManager(),
    [
      'exec',
      'webpack',
      '--',
      ...(isInteractive ? ['--progress'] : []),
      ...(options?.args || []),
    ],
    {
      stdio: 'inherit',
      cwd: projectDir,
    }
  )
}
