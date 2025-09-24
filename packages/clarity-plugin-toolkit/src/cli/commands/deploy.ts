import * as yargs from 'yargs'
import { getClarityUrl } from '../../getClarityUrl'
import fs from 'fs-extra'
import z from 'zod'
import prompt from 'prompts'
import getProject from '../../getProject'
import * as build from './build'
import * as pack from './pack'
import shouldBuild from '../../shouldBuild'
import { getSigningKey } from '../../getSigningKey'
import chalk from 'chalk'
import { confirm } from '../../util/confirm'
import dedent from 'dedent-js'
import open from 'open'
import { isInteractive } from '../../util/isInteractive'

export const command = 'deploy'
export const description = `build (if necessary) and deploy to Clarity`

type Options = {
  env?: string[]
}

const ErrorResponseSchema = z.object({
  code: z.string(),
})

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs
    .usage('$0 deploy')
    .option('env', {
      type: 'string',
      array: true,
      default: ['production'],
    })
    .option('setActive', {
      type: 'boolean',
      demandOption: false,
    })
    .option('restartServices', {
      type: 'boolean',
      demandOption: false,
    })

export async function handler({
  env,
}: yargs.Arguments<Options>): Promise<void> {
  const { packageJson, distTarball } = await getProject()
  if (await shouldBuild({ env })) await build.handler({ env })

  const clarityUrl = await getClarityUrl()
  await getSigningKey()

  await pack.handler()

  // eslint-disable-next-line no-console
  console.error(
    `🚀 Deploying ${packageJson.name}@${packageJson.version} to ${clarityUrl}...`
  )

  const doUpload = async ({
    overwrite,
  }: { overwrite?: boolean } = {}): Promise<void> => {
    const url = new URL('/api/plugins/upload', clarityUrl)
    if (overwrite) url.searchParams.set('overwrite', 'true')

    const [uploadResponse] = await Promise.all([
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-tar',
          'Content-Encoding': 'gzip',
        },
        body: fs.createReadStream(distTarball),
        duplex: 'half',
      }),
    ])

    if (uploadResponse.ok) {
      // eslint-disable-next-line no-console
      console.error(
        `${chalk.greenBright('✔')} Deployed ${packageJson.name}@${packageJson.version}!`
      )
    } else {
      if (
        uploadResponse.headers
          .get('content-type')
          ?.startsWith('application/json')
      ) {
        const body = await uploadResponse.json()
        const parsed = ErrorResponseSchema.safeParse(body)
        if (parsed.success && parsed.data.code === 'API_ERROR_ALREADY_EXISTS') {
          const { overwrite } = await prompt({
            name: 'overwrite',
            type: 'confirm',
            initial: false,
            message: `⚠️ Plugin ${packageJson.name}@${packageJson.version} already exists.  Overwrite?`,
          })
          if (overwrite) await doUpload({ overwrite: true })
          return
        }
        // eslint-disable-next-line no-console
        console.error(body)
        return
      }
      // eslint-disable-next-line no-console
      console.error(
        `${chalk.redBright('✘')} Upload failed with status ${uploadResponse.status}`
      )
      // eslint-disable-next-line no-console
      console.error(
        await uploadResponse
          .text()
          .catch(() => '(failed to get error response text)')
      )
      return
    }

    if (isInteractive) {
      const activateUrl = new URL(
        `/superadmin/plugins/${encodeURIComponent(packageJson.name)}`,
        clarityUrl
      )

      // eslint-disable-next-line no-console
      console.error(dedent`

      You will need to activate this plugin version in Clarity (requires superadmin access).
      Press enter to open ${chalk.underline(activateUrl)} in your default browser.
      Then click on version ${chalk.bold(packageJson.version)} in the list that appears to open
      a dropdown menu, and click ${chalk.bold('Activate')} in the menu.

    `)

      if (await confirm(`Open ${activateUrl}?`, { initial: true })) {
        await open(activateUrl.toString(), { wait: false }).then((child) =>
          child.unref()
        )
      }
    }
  }
  await doUpload()
}
