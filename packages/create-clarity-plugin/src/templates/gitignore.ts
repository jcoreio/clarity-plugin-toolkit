import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function gitignore({
  clarityPluginToolkitDir,
  useTypescript,
}: TemplateOptions) {
  return {
    '.gitignore': dedent`
      node_modules
      /${clarityPluginToolkitDir}
      ${useTypescript ? '/tsconfig.tsbuildinfo' : ''}
    `,
  }
}
