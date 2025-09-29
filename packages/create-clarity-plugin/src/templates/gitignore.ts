import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function gitignore({ clarityPluginToolkitDir }: TemplateOptions) {
  return {
    '.gitignore': dedent`
      node_modules
      /${clarityPluginToolkitDir}
    `,
  }
}
