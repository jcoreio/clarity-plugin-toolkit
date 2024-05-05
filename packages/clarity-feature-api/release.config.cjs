/* eslint-env node, es2018 */
const { name: pkg } = require('./package.json')
const makeReleaseConfig = require('../../makeReleaseConfig.cjs')
module.exports = makeReleaseConfig(pkg)
