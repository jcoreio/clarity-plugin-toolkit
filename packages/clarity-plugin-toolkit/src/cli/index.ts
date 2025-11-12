#!/usr/bin/env node

import chalk from 'chalk'
import '../checkNodeVersion.ts'
import * as dotenv from 'dotenv'
import * as build from './commands/build.ts'
import * as clean from './commands/clean.ts'
import * as clearSigningKey from './commands/clear-signing-key.ts'
import * as deploy from './commands/deploy.ts'
import * as dev from './commands/dev.ts'
import * as pack from './commands/pack.ts'
import * as pullImage from './commands/pull-image.ts'
import * as setSigningKey from './commands/set-signing-key.ts'

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
  .command(clean)
  .command(build)
  .command(clearSigningKey)
  .command(deploy)
  .command(dev)
  .command(pack)
  .command(pullImage)
  .command(setSigningKey)
  .strict()
  .demandCommand()
  .help().argv
