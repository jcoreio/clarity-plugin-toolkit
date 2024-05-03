#!/usr/bin/env node
import yargs from 'yargs'
import prompt from 'prompts'
import execa from 'execa'
import path from 'path'
import fs from 'fs-extra'
import dedent from 'dedent-js'
import chalk from 'chalk'
import validateNpmPackageName from 'validate-npm-package-name'

export const command = '$0'
export const description = `create a new Clarity feature project`

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
      initial: 'my-feature',
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
      client: {},
    },
    scripts: {
      clean: 'clarity-feature clean',
      build: 'clarity-feature build',
      deploy: 'clarity-feature deploy',
      'clarity-feature': 'clarity-feature',
    },
    dependencies: sortKeys({
      '@jcoreio/clarity-feature-api': '^2.0.0',
      react: '^18.2.0',
    }),
    devDependencies: sortKeys({
      '@jcoreio/clarity-feature-toolkit': '^1.0.0',
      webpack: '^5',
      ...(useTypescript
        ? {
            '@types/react': '^18.2.0',
            '@types/node': `^20`,
            typescript: '^5',
          }
        : {}),
      ...(useEslint
        ? {
            eslint: '^8',
            'eslint-config-next': '14.2.3',
          }
        : {}),
    }),
  }

  await fs.writeJson('package.json', packageJson, { spaces: 2 })

  const clarityFeatureToolkitDir = '.clarity-feature-toolkit'

  const files = {
    'README.md': dedent`
    `,
    '.gitignore': dedent`
      node_modules
      /${clarityFeatureToolkitDir}
    `,
    'webpack.config.js': dedent`
      const { makeWebpackConfig } = require('@jcoreio/clarity-feature-toolkit/client')

      module.exports = (env, argv) => makeWebpackConfig(env, argv)
    `,
    ...(useTypescript
      ? {
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
                clarityFeatureToolkitDir
              )}]
            }
          `,
        }
      : {}),
    ...(useEslint
      ? {
          '.eslintrc.json': dedent`
            {
              "extends": "next/core-web-vitals"
            }
          `,
        }
      : {}),
  }
  await Promise.all(
    Object.entries(files).map(async ([name, content]) => {
      const file = path.resolve(cwd, name)
      await fs.writeFile(file, content + '\n', 'utf8')
    })
  )

  const packageManager = 'pnpm'

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
    ['commit', '-m', `chore: initial commit from create-clarity-feature`],
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
