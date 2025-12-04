import execa from 'execa'
import { parseDockerCompose } from '../../util/parseDockerCompose.ts'
import { loginToECR } from '../../util/loginToECR.ts'

export async function handler(): Promise<void> {
  const config = await parseDockerCompose()
  const appConfig = config.services.app
  const { image } = appConfig

  await loginToECR()
  await execa('docker', ['pull', image], { stdio: 'inherit' })
}
