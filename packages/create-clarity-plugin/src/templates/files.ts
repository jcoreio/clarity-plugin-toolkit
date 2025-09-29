import { clientIndex } from './clientIndex'
import { eslintConfig } from './eslintConfig'
import { gitignore } from './gitignore'
import { makePackageJson } from './packageJson'
import { prettierIgnore } from './prettierIgnore'
import { readme } from './readme'
import { TemplateOptions } from './TemplateOptions'
import { toolchainConfig } from './toolchainConfig'
import { tsconfig } from './tsconfig'
import { webpackConfig } from './webpackConfig'
import { format } from 'prettier'

export async function files(templateOptions: TemplateOptions) {
  const result: { [file in string]?: string } = {
    'package.json': JSON.stringify(makePackageJson(templateOptions), null, 2),
    ...readme(templateOptions),
    ...gitignore(templateOptions),
    ...prettierIgnore(templateOptions),
    ...clientIndex(templateOptions),
    ...tsconfig(templateOptions),
    ...webpackConfig(templateOptions),
    ...eslintConfig(templateOptions),
    ...toolchainConfig(templateOptions),
  }
  for (const file in result) {
    if (result[file] == null || !/\.([cm]?[jt]sx?|json|md)/.test(file)) continue
    result[file] = await format(result[file], { filepath: file })
  }
  return result
}
