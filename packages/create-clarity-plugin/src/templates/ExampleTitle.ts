import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function ExampleTitle({ stubs }: TemplateOptions) {
  if (stubs?.includes('organizationView')) {
    return {
      'src/client/ExampleTitle.tsx': dedent`
        import * as React from 'react'

        export default function ExampleTitle() {
          return <div data-component="ExampleTitle">Example</div>
        }
      `,
    }
  }
}
