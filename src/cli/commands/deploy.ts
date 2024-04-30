// eslint-disable-next-line @typescript-eslint/no-unused-vars
import yargs from 'yargs'

export const command = 'deploy'
export const description = `deploy to Clarity`

type Options = {}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 deploy')

export async function handler(): Promise<void> {}
