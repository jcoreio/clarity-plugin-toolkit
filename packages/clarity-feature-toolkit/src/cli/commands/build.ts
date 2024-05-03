// eslint-disable-next-line @typescript-eslint/no-unused-vars
import yargs from 'yargs'
import execa from 'execa'
import getProject from '../../getProject'

export const command = 'build'
export const description = `build bundles for deployment`

type Options = {
  // empty for now
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 build')

export async function handler(): Promise<void> {
  const { projectDir } = await getProject()
  await execa('npm', ['exec', 'webpack'], { stdio: 'inherit', cwd: projectDir })
}
