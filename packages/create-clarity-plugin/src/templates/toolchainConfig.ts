import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function toolchainConfig({ useToolchain }: TemplateOptions) {
  if (!useToolchain) return
  return {
    'toolchain.config.cjs': dedent`
      /* eslint-env node, es2018 */
      module.exports = {
        cjsBabelEnv: { forceAllTransforms: true },
        // esmBabelEnv: { targets: { node: 16 } },
        scripts: {
          'clean': 'clarity-plugin-toolkit clean',
          'build': 'clarity-plugin-toolkit build',
          'deploy': 'clarity-plugin-toolkit deploy'
        }
      }
    `,
  }
}
