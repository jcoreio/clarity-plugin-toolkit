#!/usr/bin/env node

import yargs from 'yargs/yargs'

yargs(process.argv.slice(2))
  .scriptName('create-clarity-feature')
  .commandDir('commands')
  .strict()
  .demandCommand()
  .help().argv
