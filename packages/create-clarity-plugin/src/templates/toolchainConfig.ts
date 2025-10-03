import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function toolchainConfig({ useToolchain }: TemplateOptions) {
  if (!useToolchain) return
  return {
    'toolchain.config.cjs': dedent`
      /* eslint-env node, es2018 */
      module.exports = {
        esmBabelEnv: { targets: { node: 20 } },
        scripts: {
          'clean': 'clarity-plugin-toolkit clean',
          'build': 'clarity-plugin-toolkit build',
          'deploy': 'clarity-plugin-toolkit deploy'
        }
      }
    `,
  }
}
