import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function prettierIgnore({
  usePrettier,
  clarityPluginToolkitDir,
}: TemplateOptions) {
  if (!usePrettier) return {}
  return {
    '.prettierIgnore': dedent`
      node_modules
      /${clarityPluginToolkitDir}
    `,
  }
}
