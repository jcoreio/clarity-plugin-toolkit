import z from 'zod'
import execa from 'execa'
import getProject from '../../getProject.ts'
import { loginToECR } from '@jcoreio/aws-ecr-utils'

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
