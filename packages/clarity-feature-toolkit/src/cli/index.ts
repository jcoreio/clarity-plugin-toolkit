#!/usr/bin/env node

import '../checkNodeVersion'

import yargs from 'yargs/yargs'

yargs(process.argv.slice(2))
  .scriptName('clarity-feature-toolkit')
  .commandDir('commands')
  .strict()
  .demandCommand()
  .help().argv
