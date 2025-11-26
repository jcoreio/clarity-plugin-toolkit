#!/usr/bin/env node
import * as yargs from 'yargs'
import prompt from 'prompts'
import execa from 'execa'
import path from 'path'
import fs from 'fs-extra'
import dedent from 'dedent-js'
import chalk from 'chalk'
import validateNpmPackageName from 'validate-npm-package-name'
import { getPackageManager } from '../../getPackageManager'
import { Stub, TemplateOptions } from '../../templates/TemplateOptions'
import { makePackageJson } from '../../templates/packageJson'
import { files } from '../../templates/files'

export const command = '$0'
export const description = `create a new Clarity plugin project`

type Options = {
  // empty for now
}

export const builder = (yargs: yargs.Argv<Options>): any =>
  yargs.usage('$0 create')

export async function handler(): Promise<void> {
  const { name, useTypescript, useToolchain } = await prompt([
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
      name: 'useToolchain',
      message: 'Use @jcoreio/toolchain?',
      initial: false,
      active: 'yes',
      inactive: 'no',
    },
  ])
  const { useEslint, usePrettier } =
    useToolchain ?
      { useEslint: true, usePrettier: true }
    : await prompt([
        {
          type: 'toggle',
          name: 'useEslint',
          message: 'Do you want to use ESLint?',
          initial: true,
          active: 'yes',
          inactive: 'no',
        },
        {
          type: 'toggle',
          name: 'usePrettier',
          message: 'Do you want to use Prettier?',
          initial: true,
          active: 'yes',
          inactive: 'no',
        },
      ])

  const stubs: Stub[] = (
    await prompt([
      {
        type: 'multiselect',
        name: 'stubs',
        message: 'Select example stubs to create:',
        choices: [
          {
            value: 'dashboardWidget',
            title: 'Dashboard Widget',
            selected: true,
          },
          {
            value: 'organizationView',
            title: 'Organization View',
            selected: true,
          },
          {
            value: 'expressApi',
            title: 'Express API',
            selected: false,
          },
          {
            value: 'sidebarItem',
            title: 'Sidebar Item',
            selected: false,
          },
          {
            value: 'sqlMigrations',
            title: 'SQL Migrations',
            selected: false,
          },
          {
            value: 'jsMigrations',
            title: `${useTypescript ? 'TS' : 'JS'} Migrations`,
            selected: false,
          },
        ] satisfies (Omit<prompt.Choice, 'value'> & { value: Stub })[],
      },
    ])
  ).stubs

  const directory = path.basename(name)

  const cwd = path.resolve(directory)

  await fs.mkdirs(path.join(cwd, 'src'))

  process.chdir(cwd)

  const clarityPluginToolkitDir = '.clarity-plugin-toolkit'

  let toolchainVersion = ''
  if (useToolchain) {
    toolchainVersion = (
      await execa('npm', ['view', '@jcoreio/toolchain', 'version'], {
        stdio: 'pipe',
      })
    ).stdout
  }

  const templateOptions: TemplateOptions = {
    name,
    useToolchain,
    toolchainVersion,
    useTypescript,
    useEslint,
    usePrettier,
    clarityPluginToolkitDir,
    stubs,
    packageManager: getPackageManager(),
  }

  const packageJson = makePackageJson(templateOptions)
  await Promise.all(
    Object.entries(await files(templateOptions)).map(
      async ([name, content]: [string, string | undefined]) => {
        if (content == null) return
        const file = path.resolve(cwd, name)
        await fs.mkdirs(path.dirname(file))
        await fs.writeFile(file, content + '\n', 'utf8')
      }
    )
  )

  const packageManager = useToolchain ? 'pnpm' : getPackageManager()

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

  if (useToolchain) {
    await execa('tc', ['migrate'], execaOpts)
  } else if (usePrettier) {
    await execa(packageManager, ['run', 'format'], execaOpts)
  }

  await execa('git', ['init'], execaOpts)
  await execa('git', ['add', '.'], execaOpts)
  await execa(
    'git',
    ['commit', '-m', `chore: initial commit from create-clarity-plugin`],
    execaOpts
  )
}
