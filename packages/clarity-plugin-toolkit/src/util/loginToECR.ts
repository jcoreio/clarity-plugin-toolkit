import { loginToECR as baseLogin } from '@jcoreio/aws-ecr-utils'
import { parseDockerCompose } from './parseDockerCompose.ts'

export async function loginToECR() {
  const config = await parseDockerCompose()
  const appConfig = config.services.app
  const { image } = appConfig

  await baseLogin({ forImages: [image] })
}
