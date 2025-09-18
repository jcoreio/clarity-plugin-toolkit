#!/usr/bin/env node

import '../checkNodeVersion'

import yargs from 'yargs/yargs'

void yargs(process.argv.slice(2))
  .scriptName('clarity-plugin-toolkit')
  .commandDir('commands')
  .strict()
  .demandCommand()
  .help().argv
