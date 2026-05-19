import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function toolchainConfig({ useToolchain }: TemplateOptions) {
  if (!useToolchain) return
  return {
    'toolchain.config.cjs': dedent`
      module.exports = {
        esmBabelEnv: { targets: { node: 24 } },
        scripts: {
          'clean': 'clarity-plugin-toolkit clean',
          'build': 'clarity-plugin-toolkit build',
          'deploy': 'clarity-plugin-toolkit deploy',
          'dev': 'clarity-plugin-toolkit dev'
        }
      }
    `,
  }
}
