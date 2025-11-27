import type * as yargs from 'yargs'
import { getClarityUrl } from '../../getClarityUrl.ts'
import fs from 'fs-extra'
import getProject from '../../getProject.ts'
import * as build from './build.ts'
import * as pack from './pack.ts'
import shouldBuild from '../../shouldBuild.ts'
import { getSigningKey } from '../../getSigningKey.ts'
import chalk from 'chalk'
import { confirm } from '../../util/confirm.ts'
import dedent from 'dedent-js'
import open from 'open'
import { isInteractive } from '../../util/isInteractive.ts'
import type { Options } from './deploy.ts'
import z from 'zod'

const ErrorResponseSchema = z.object({
  code: z.string(),
})

export async function handler({
  env,
  overwrite,
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

    const uploadResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-tar',
        'Content-Encoding': 'gzip',
      },
      body: fs.createReadStream(distTarball),
      duplex: 'half',
    }).catch((error: unknown) => {
      if (
        error != null &&
        typeof error === 'object' &&
        'cause' in error &&
        error.cause instanceof Error
      ) {
        error = error.cause
      }
      // eslint-disable-next-line no-console
      console.error(
        chalk`{redBright ✘} {red Failed to upload to Clarity:}`,
        error instanceof AggregateError ?
          chalk.red(error.errors.map((error) => error.message).join('; '))
        : error instanceof Error ? chalk.red(error.message)
        : error
      )
      process.exit(1)
    })

    if (uploadResponse.ok) {
      // eslint-disable-next-line no-console
      console.error(
        chalk`{greenBright ✔ Deployed ${packageJson.name}@${packageJson.version}!}`
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
          const overwrite = await confirm(
            chalk.yellow(
              `⚠️ Plugin ${packageJson.name}@${packageJson.version} already exists.  Overwrite?`
            ),
            { initial: false, valueIfNotInteractive: false }
          )
          if (overwrite) {
            await doUpload({ overwrite: true })
            return
          } else if (!isInteractive) {
            // eslint-disable-next-line no-console
            console.error(
              chalk`{redBright ✘} {red Plugin ${packageJson.name}@${packageJson.version} already exists}`
            )
          }
          process.exit(1)
        }
        // eslint-disable-next-line no-console
        console.error(body)
        process.exit(1)
      }
      // eslint-disable-next-line no-console
      console.error(
        chalk`{redBright ✘} {red Upload failed with status ${uploadResponse.status}}`
      )
      // eslint-disable-next-line no-console
      console.error(
        chalk.red(
          await uploadResponse
            .text()
            .catch(() => '(failed to get error response text)')
        )
      )
      process.exit(1)
    }

    if (
      isInteractive &&
      !parseInt(process.env.CLARITY_PLUGIN_TOOLKIT_NO_ACTIVATE_PROMPT || '0')
    ) {
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
  await doUpload({ overwrite })
}
