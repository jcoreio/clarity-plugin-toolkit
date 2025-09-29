import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function webpackConfig({ useTypescript }: TemplateOptions) {
  return useTypescript ?
      {
        'webpack.config.ts': dedent`
          import { makeWebpackConfig } from '@jcoreio/clarity-plugin-toolkit'

          export default (
            env: {[name in string]?: string},
            argv: {[name in string]?: unknown}
          ) => makeWebpackConfig(env, argv)
        `,
      }
    : {
        'webpack.config.mjs': dedent`
          import { makeWebpackConfig } from '@jcoreio/clarity-plugin-toolkit'

          export default (env, argv) => makeWebpackConfig(env, argv)
        `,
      }
}
