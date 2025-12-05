#!/usr/bin/env node

import yargs from 'yargs/yargs'
import * as create from './commands/create'

void yargs(process.argv.slice(2))
  .scriptName('create-clarity-plugin')
  .command(create)
  .strict()
  .demandCommand()
  .help().argv
