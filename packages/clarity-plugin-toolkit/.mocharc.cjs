/* eslint-env node, es2018 */
const base = require('@jcoreio/toolchain-mocha/.mocharc.cjs')
const { getSpecs } = require('@jcoreio/toolchain-mocha')
module.exports = {
  ...base,
  'node-option': base['node-option']?.filter(
    (o) => !o.includes('experimental-default-type')
  ),
  require: [...base.require, 'test/configure.ts'],
  spec: getSpecs(['test']),
}
