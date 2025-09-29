import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function eslintConfig({
  useToolchain,
  useEslint,
  useTypescript,
  usePrettier,
}: TemplateOptions) {
  if (!useEslint || useToolchain) return {}
  return {
    'eslint.config.mjs': dedent`
      ${
        useTypescript ?
          dedent`
            // @ts-check

            import tseslint from 'typescript-eslint'
          ` + '\n'
        : `import { defineConfig } from 'eslint/config'\n`
      }import eslint from '@eslint/js'
      import globals from 'globals'
      import reactPlugin from 'eslint-plugin-react'
      import { includeIgnoreFile } from '@eslint/compat'
      import { fileURLToPath } from 'node:url'
      ${usePrettier ? `import eslintConfigPrettier from 'eslint-config-prettier'` : ''}

      const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

      export default ${useTypescript ? 'tseslint.config(' : 'defineConfig(['}
        eslint.configs.recommended,
        ${
          useTypescript ?
            dedent`
              tseslint.configs.recommended,
            ` + '\n'
          : ''
        }includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
        {
          files: ['./*.{js,mjs}'],
          languageOptions: { globals: { ...globals.node } },
        },
        {
          ...reactPlugin.configs.flat.recommended,
          files: ['src/client/**/*.{js,jsx,mjs,cjs${useTypescript ? ',ts,tsx' : ''}'],
          languageOptions: {
            ...reactPlugin.configs.flat.recommended.languageOptions,
            globals: { ...globals.serviceworker, ...globals.browser },
          },
        },
        ${
          usePrettier ?
            dedent`
              eslintConfigPrettier,
            `
          : ''
        }
      ${useTypescript ? ')' : '])'}
    `,
  }
}
