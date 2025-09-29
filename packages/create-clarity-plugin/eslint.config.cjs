const { defineConfig, globalIgnores } = require('eslint/config')

module.exports = defineConfig([
  ...require('@jcoreio/toolchain/eslintConfig.cjs'),
  globalIgnores(['test/*/**']),
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 0,
    },
  },
])
