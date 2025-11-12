import getProject from '../getProject.ts'

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

export async function getPackageManager(): Promise<PackageManager> {
  let userAgent = process.env.npm_config_user_agent
  if (!userAgent) {
    const {
      packageJson: { packageManager },
    } = await getProject()
    userAgent = typeof packageManager === 'string' ? packageManager : ''
  }

  if (userAgent.startsWith('yarn')) {
    return 'yarn'
  }

  if (userAgent.startsWith('pnpm')) {
    return 'pnpm'
  }

  if (userAgent.startsWith('bun')) {
    return 'bun'
  }

  return 'npm'
}
