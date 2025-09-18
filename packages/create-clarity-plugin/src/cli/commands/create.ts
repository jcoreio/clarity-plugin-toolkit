#!/usr/bin/env node
import yargs from 'yargs'
import prompt from 'prompts'
import execa from 'execa'
import path from 'path'
import fs from 'fs-extra'
import dedent from 'dedent-js'
import chalk from 'chalk'
import validateNpmPackageName from 'validate-npm-package-name'
import { getPackageManager } from '../../getPackageManager'

export const command = '$0'
export const description = `create a new Clarity plugin project`

type Options = {
  // empty for now
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 create')

export async function handler(): Promise<void> {
  const { name, useTypescript, useEslint } = await prompt([
    {
      type: 'text',
      name: 'name',
      message: 'Package name:',
      initial: 'my-plugin',
      validate: (name: string) => {
        name = name.trim()
        if (!name) return 'is required'
        if (!validateNpmPackageName(name).validForNewPackages)
          return 'invalid package name'
        return true
      },
    },
    {
      type: 'toggle',
      name: 'useTypescript',
      message: 'Do you want to use TypeScript?',
      initial: true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'toggle',
      name: 'useEslint',
      message: 'Do you want to use ESLint?',
      initial: true,
      active: 'yes',
      inactive: 'no',
    },
  ])

  const directory = path.basename(name)

  const cwd = path.resolve(directory)

  await fs.mkdirs(path.join(cwd, 'src'))

  process.chdir(cwd)

  const packageJson = {
    name,
    version: '0.1.0',
    private: true,
    contributes: {
      client: './src/client/index.tsx',
    },
    scripts: {
      clean: 'clarity-plugin-toolkit clean',
      build: 'clarity-plugin-toolkit build',
      deploy: 'clarity-plugin-toolkit deploy',
      'clarity-plugin-toolkit': 'clarity-plugin-toolkit',
    },
    dependencies: sortKeys({
      '@jcoreio/clarity-plugin-api': '^3.0.0-beta',
      react: '^18.2.0',
    }),
    devDependencies: sortKeys({
      '@jcoreio/clarity-plugin-toolkit': '^2.0.0-beta',
      webpack: '^5',
      ...(useTypescript ?
        {
          '@babel/register': '^7.28.3',
          '@types/react': '^18.2.0',
          '@types/node': `^20`,
          typescript: '^5',
        }
      : {}),
      ...(useEslint ?
        {
          '@eslint/compat': '^1.3.2',
          '@eslint/js': '^9.33.0',
          eslint: '^9',
          'eslint-plugin-react': '^7.37.5',
          globals: '^16.0.0',
          ...(useTypescript ?
            {
              'typescript-eslint': '^8.40.0',
            }
          : {}),
        }
      : {}),
    }),
  }

  await fs.writeJson('package.json', packageJson, { spaces: 2 })

  const clarityPluginToolkitDir = '.clarity-plugin-toolkit'

  const files = {
    'README.md': dedent`
      This is a [Clarity](https://www.jcore.io/clarity) plugin project bootstrapped with [\`create-clarity-plugin\`](https://github.com/jcoreio/clarity-plugin-toolkit/tree/master/packages/create-clarity-plugin).

      ## Getting Started

      At the moment, the only contribution point your plugin can make is a dashboard widget.
      There will be more contribution points soon, but for now, declare the dashboard widget
      in \`src/client/index.${useTypescript ? 'tsx' : 'js'}\`:

      \`\`\`${useTypescript ? 'tsx' : 'js'}
      ${
        useTypescript ?
          dedent`
            import { type ClientPluginContributions } from '@jcoreio/clarity-plugin-toolkit/client'
          ` + '\n'
        : ''
      }export default {
        dashboardWidgets: {
          MyWidget: {
            displayName: 'MyWidget',
            component: React.lazy(() => import('./MyWidget'))
          }
        }
      }${useTypescript ? ' satisfies ClientPluginContributions' : ''}
      \`\`\`

      Then create the widget file:

      \`\`\`${useTypescript ? 'tsx' : 'js'}
      import * as React from 'react'
      import {
        useTagState,
        useDrop,
        DashboardWidgetProps,
      } from '@jcoreio/clarity-plugin-api/client'

      ${
        useTypescript ?
          dedent`
            type MyWidgetConfig = {
              tag?: string
            }

            export type MyWidgetProps = DashboardWidgetProps<
              MyWidgetConfig | undefined
            >
          ` + '\n'
        : ''
      }
      export default function MyWidget({
        config,
        setConfig,
      }${useTypescript ? ': MyWidgetProps' : ''}) {
        const tag = config?.tag
        const tagState = useTagState(tag)
        const [, connectDropTarget] = useDrop({
          canDrop: ({ tag }) => tag != null,
          drop: ({ tag }) => {
            if (tag) setConfig({ tag })
            return undefined
          },
        })
        return (
          <div ref={connectDropTarget}>
            <h1>My Widget</h1>
            <pre>{JSON.stringify(config, null, 2)}</pre>
            <pre>{JSON.stringify(tagState, null, 2)}</pre>
          </div>
        )
      }
      \`\`\`

      ## Deploying

      Run \`npm run deploy\`, and \`clarity-plugin-toolkit\` will run through the process of deploying to
      Clarity in an interactive CLI.
    `,
    '.gitignore': dedent`
      node_modules
      /${clarityPluginToolkitDir}
    `,
    ...(useTypescript ?
      {
        'src/client/index.tsx': dedent`
          import { type ClientPluginContributions } from '@jcoreio/clarity-plugin-toolkit/client'

          export default {
            // add contributions here
          } satisfies ClientPluginContributions
        `,
        'tsconfig.json': dedent`
            {
              "compilerOptions": {
                "lib": ["dom", "dom.iterable", "esnext"],
                "allowJs": true,
                "skipLibCheck": true,
                "strict": true,
                "noEmit": true,
                "esModuleInterop": true,
                "module": "esnext",
                "moduleResolution": "bundler",
                "resolveJsonModule": true,
                "isolatedModules": true,
                "jsx": "preserve",
                "incremental": true,
              },
              "include": ["**/*.tsx"],
              "exclude": ["node_modules", ${JSON.stringify(
                clarityPluginToolkitDir
              )}]
            }
          `,
        'webpack.config.ts': dedent`
          import { makeWebpackConfig } from '@jcoreio/clarity-plugin-toolkit'

          export default (
            env: {[name in string]?: string},
            argv: {[name in string]?: unknown}
          ) => makeWebpackConfig(env, argv)
        `,
      }
    : {
        'src/client/index.js': dedent`
          export default {
            // add contributions here
          }
        `,
        'webpack.config.mjs': dedent`
          import { makeWebpackConfig } from '@jcoreio/clarity-plugin-toolkit'

          export default (env, argv) => makeWebpackConfig(env, argv)
        `,
      }),
    ...(useEslint ?
      {
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
            }
          ${useTypescript ? ')' : '])'}
        `,
      }
    : {}),
  }
  await Promise.all(
    Object.entries(files).map(async ([name, content]) => {
      const file = path.resolve(cwd, name)
      await fs.mkdirs(path.dirname(file))
      await fs.writeFile(file, content + '\n', 'utf8')
    })
  )

  const packageManager = getPackageManager()

  // eslint-disable-next-line no-console
  console.error(dedent`

    Creating project in ${chalk.greenBright(cwd)}.

    Using ${chalk.bold(packageManager)}.

    Installing dependencies:
    ${Object.keys(packageJson.dependencies)
      .map((dep) => chalk`- {cyan ${dep}}`)
      .join('\n')}

    Installing devDependencies:
    ${Object.keys(packageJson.devDependencies)
      .map((dep) => chalk`- {cyan ${dep}}`)
      .join('\n')}
    
  `)

  const execaOpts = { cwd, stdio: 'inherit' } as const

  await execa(packageManager, ['install'], execaOpts)

  await execa('git', ['init'], execaOpts)
  await execa('git', ['add', '.'], execaOpts)
  await execa(
    'git',
    ['commit', '-m', `chore: initial commit from create-clarity-plugin`],
    execaOpts
  )
}

function sortKeys<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.keys(obj)
      .sort()
      .map((key) => [key, obj[key as keyof T]])
  ) as T
}
