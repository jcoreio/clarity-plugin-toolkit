const { defineConfig } = require('eslint/config')

module.exports = defineConfig([
  ...require('@jcoreio/toolchain/eslintConfig.cjs'),
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 0,
    },
  },
])
