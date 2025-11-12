/* eslint-env node, es2018 */
/* global process */

const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = {
  cjsBabelEnv: { targets: { node: 20 } },
  esmBabelEnv: { targets: { node: 20 } },
  // outputEsm: false, // disables ESM output (default: true)
  // esWrapper: true, // outputs ES module wrappers for CJS modules (default: false)
  scripts: {
    pretest: {
      description: 'prepare for testing',
      run: async (args) => {
        if (args.includes('--watch')) return
        await execa(
          `tc build && (cd ../../fixtures/test-plugin && (pnpm remove @jcoreio/clarity-plugin-toolkit || true) && pnpm i '@jcoreio/clarity-plugin-toolkit@workspace:*')`,
          {
            shell: true,
            env: {
              ...process.env,
              JCOREIO_TOOLCHAIN_ESM: '',
              JCOREIO_TOOLCHAIN_CJS: '',
              JCOREIO_TOOLCHAIN_TEST: '',
              JCOREIO_TOOLCHAIN_COVERAGE: '',
            },
          }
        )
      },
    },
    'build:smoke-test': {
      description: 'override CLI smoke test',
      run: async () => {
        await execa('node', ['dist/index.js'])
        await execa('node', ['dist/index.cjs'])
        await execa('node', ['dist/client/index.js'])
        await execa('node', ['dist/client/index.cjs'])
        await execa('node', ['dist/cli/index.js', '--help'])
        await execa('node', ['dist/cli/index.cjs', '--help'])
      },
    },
  },
}
