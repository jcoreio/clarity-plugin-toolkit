/* eslint-env node, es2018 */

const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = {
  cjsBabelEnv: { targets: { node: 20 } },
  // esmBabelEnv: { targets: { node: 16 } },
  outputEsm: false, // disables ESM output (default: true)
  // esWrapper: true, // outputs ES module wrappers for CJS modules (default: false)
  scripts: {
    pretest: {
      description: 'prepare for testing',
      run: async (args) => {
        if (args.includes('--watch')) return
        await execa(
          `tc build && (cd ../../fixtures/test-plugin && (pnpm remove @jcoreio/clarity-plugin-toolkit || true) && pnpm i '@jcoreio/clarity-plugin-toolkit@workspace:*')`,
          { shell: true }
        )
      },
    },
    'build:smoke-test': {
      description: 'no-op',
      run: () => {},
    },
  },
}
