#!/usr/bin/env node

import chalk from 'chalk'
import '../checkNodeVersion'
import * as dotenv from 'dotenv'
import path from 'path'

const envValues: typeof process.env = {}
dotenv.config({
  quiet: true,
  // @ts-expect-error dotenv types are in the wrong here
  processEnv: envValues,
})

let warnedAboutInterpolation = false
for (const key in envValues) {
  if (key.startsWith('CLARITY_PLUGIN_TOOLKIT_')) {
    const value = envValues[key]
    if (value == null) continue
    if (value.includes('$')) {
      if (!warnedAboutInterpolation) {
        // eslint-disable-next-line no-console
        console.error(
          chalk.yellow(
            `Warning: clarity-plugin-toolkit doesn't support interpolation in .env yet (found ${key}=${value})`
          )
        )
        warnedAboutInterpolation = true
      }
      continue
    }
    process.env[key] = value
  }
}

import yargs from 'yargs/yargs'

void yargs(process.argv.slice(2))
  .scriptName('clarity-plugin-toolkit')
  .commandDir('commands', {
    extensions: [path.extname(__filename).replace(/^\./, '')],
  })
  .strict()
  .demandCommand()
  .help().argv
