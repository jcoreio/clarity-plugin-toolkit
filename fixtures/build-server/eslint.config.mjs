// @ts-check

import tseslint from 'typescript-eslint'
import eslint from '@eslint/js'
import globals from 'globals'
import { includeIgnoreFile } from '@eslint/compat'
import { fileURLToPath } from 'node:url'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
  {
    files: ['./*.{js,mjs}'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['src/client/**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      globals: { ...globals.serviceworker, ...globals.browser },
    },
  }
)
