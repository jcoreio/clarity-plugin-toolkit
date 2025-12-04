import z from 'zod'
import getProject from '../getProject.ts'
import execa from 'execa'

export async function parseDockerCompose() {
  const { projectDir } = await getProject()
  return z
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
}
