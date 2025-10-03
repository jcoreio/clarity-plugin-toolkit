import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function ExampleOrganizationView({ stubs }: TemplateOptions) {
  if (stubs?.includes('organizationView')) {
    return {
      'src/client/ExampleOrganizationView.tsx': dedent`
        import * as React from 'react'

        export default function ExampleOrganizationView() {
          return <div data-component="ExampleTitle">Example</div>
        }
      `,
    }
  }
}
