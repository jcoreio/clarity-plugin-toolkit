/* eslint-env node, es2018 */

module.exports = {
  cjsBabelEnv: { targets: { node: 20 } },
  // esmBabelEnv: { targets: { node: 16 } },
  outputEsm: false, // disables ESM output (default: true)
  // esWrapper: true, // outputs ES module wrappers for CJS modules (default: false)
  scripts: {
    pretest: `tc build && (cd ../../fixtures/test-plugin && (pnpm remove @jcoreio/clarity-plugin-toolkit || true) && pnpm i '@jcoreio/clarity-plugin-toolkit@workspace:*')`,
    'build:smoke-test': {
      description: 'no-op',
      run: () => {},
    },
  },
}
