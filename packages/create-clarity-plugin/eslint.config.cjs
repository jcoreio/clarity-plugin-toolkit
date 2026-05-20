const globals = require('globals')
const { defineConfig, globalIgnores } = require('eslint/config')

module.exports = defineConfig([
  ...require('@jcoreio/toolchain/eslintConfig.cjs'),
  globalIgnores(['test/*/**']),
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 0,
    },
  },
  {
    files: ['test/fixtures/use-typescript-and-toolchain/toolchain.config.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['test/fixtures/use-typescript-and-toolchain/toolchain.config.cjs'],
    languageOptions: {
      globals: globals.es2018,
    },
  },
])
