import { clientIndex } from './clientIndex'
import { eslintConfig } from './eslintConfig'
import { ExampleOrganizationView } from './ExampleOrganizationView'
import { ExampleSidebarItem } from './ExampleSidebarItem'
import { ExampleTitle } from './ExampleTitle'
import { ExampleWidget } from './ExampleWidget'
import { gitignore } from './gitignore'
import { makePackageJson } from './packageJson'
import { prettierIgnore } from './prettierIgnore'
import { readme } from './readme'
import { serverMigrate } from './serverMigrate'
import { serverMigrationsExampleSql } from './serverMigrationsExampleSql'
import { serverMigrationsExampleTs } from './serverMigrationsExampleTs'
import { serverWebapp } from './serverWebapp'
import { TemplateOptions } from './TemplateOptions'
import { toolchainConfig } from './toolchainConfig'
import { tsconfig } from './tsconfig'
import { webpackConfig } from './webpackConfig'
import { format } from 'prettier'

export async function files(templateOptions: TemplateOptions) {
  const raw: { [file in string]?: string } = {
    'package.json': JSON.stringify(makePackageJson(templateOptions), null, 2),
    ...readme(templateOptions),
    ...gitignore(templateOptions),
    ...prettierIgnore(templateOptions),
    ...clientIndex(templateOptions),
    ...tsconfig(templateOptions),
    ...webpackConfig(templateOptions),
    ...eslintConfig(templateOptions),
    ...toolchainConfig(templateOptions),
    ...ExampleWidget(templateOptions),
    ...ExampleSidebarItem(templateOptions),
    ...ExampleTitle(templateOptions),
    ...ExampleOrganizationView(templateOptions),
    ...serverMigrate(templateOptions),
    ...serverMigrationsExampleSql(templateOptions),
    ...serverMigrationsExampleTs(templateOptions),
    ...serverWebapp(templateOptions),
  }
  const result: { [file in string]?: string } = {}
  for (let file in raw) {
    let content = raw[file]
    if (content == null || !/\.([cm]?[jt]sx?|json|md)/.test(file)) {
      result[file] = content
      continue
    }
    if (/\.tsx?$/.test(file) && !templateOptions.useTypescript) {
      const { transformAsync } = await import('@babel/core')
      content =
        (
          await transformAsync(content, {
            filename: file,
            plugins: /\.tsx$/.test(file) ? ['@babel/plugin-syntax-jsx'] : [],
            presets: [
              ['@babel/preset-env', { modules: false, targets: { node: 24 } }],
              '@babel/preset-typescript',
            ],
            sourceType: 'module',
          })
        )?.code || content
      file = file.replace(/\.tsx?$/, '.js')
    }
    result[file] = await format(content, { filepath: file })
  }
  return result
}
