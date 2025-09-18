#!/usr/bin/env node

import yargs from 'yargs/yargs'

void yargs(process.argv.slice(2))
  .scriptName('create-clarity-plugin')
  .commandDir('commands')
  .strict()
  .demandCommand()
  .help().argv
