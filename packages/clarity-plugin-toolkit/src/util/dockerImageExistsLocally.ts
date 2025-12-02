import execa from 'execa'

export async function dockerImageExistsLocally(
  image: string
): Promise<boolean> {
  const { stdout } = await execa('docker', ['images', '-q', image], {
    stdio: 'pipe',
    encoding: 'utf8',
  })
  return stdout.trim().length > 0
}
