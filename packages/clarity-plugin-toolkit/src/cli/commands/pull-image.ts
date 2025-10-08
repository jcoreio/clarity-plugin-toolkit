import { loginToECR } from '@jcoreio/aws-ecr-utils'
import z from 'zod'
import getProject from '../../getProject'
import execa from 'execa'

export const command = 'pull-image'
export const description = `pull Clarity docker image`

export async function handler(): Promise<void> {
  const { projectDir } = await getProject()
  const config = z
    .object({
      services: z.object({
        app: z.object({
          image: z.string(),
        }),
      }),
    })
    .parse(
      JSON.parse(
        (
          await execa('docker', ['compose', 'config', '--format', 'json'], {
            cwd: projectDir,
            stdio: 'pipe',
            maxBuffer: 10 * 1024 * 1024,
          })
        ).stdout
      )
    )

  const appConfig = config.services.app
  const { image } = appConfig

  await loginToECR({})
  await execa('docker', ['pull', image], { stdio: 'inherit' })
}
