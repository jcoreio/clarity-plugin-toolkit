import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function clientIndex({ useTypescript }: TemplateOptions) {
  if (useTypescript) {
    return {
      'src/client/index.tsx': dedent`
        import { type ClientPluginContributions } from '@jcoreio/clarity-plugin-api/client'

        export default {
          // add contributions here
        } satisfies ClientPluginContributions
      `,
    }
  }

  return {
    'src/client/index.js': dedent`
      export default {
        // add contributions here
      }
    `,
  }
}
