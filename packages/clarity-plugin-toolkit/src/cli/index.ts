#!/usr/bin/env node

import '../checkNodeVersion.ts'
import './loadEnv.ts'
import * as build from './commands/build.ts'
import * as clean from './commands/clean.ts'
import * as clearSigningKey from './commands/clear-signing-key.ts'
import * as deploy from './commands/deploy.ts'
import * as dev from './commands/dev.ts'
import * as pack from './commands/pack.ts'
import * as pullImage from './commands/pull-image.ts'
import * as setSigningKey from './commands/set-signing-key.ts'

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
