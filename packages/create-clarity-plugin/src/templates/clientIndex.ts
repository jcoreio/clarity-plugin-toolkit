import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function clientIndex({ stubs }: TemplateOptions) {
  if (
    !stubs?.includes('dashboardWidget') &&
    !stubs?.includes('organizationView') &&
    !stubs?.includes('sidebarItem')
  ) {
    return {}
  }
  return {
    'src/client/index.tsx': dedent`
      import { type ClientPluginContributions } from '@jcoreio/clarity-plugin-api/client'

      export default {
        ${
          stubs.includes('dashboardWidget') ?
            dedent`
              dashboardWidgets: {
                exampleWidget: {
                  displayName: 'Example Widget',
                  component: () => import('./ExampleWidget'),
                },
              },
            `
          : ''
        }
        ${
          stubs.includes('sidebarItem') ?
            dedent`
              sidebarSections: () => import('./ExampleSidebarItem'),
            `
          : ''
        }
        ${
          stubs.includes('organizationView') ?
            dedent`
              navbarTitle: {
                organization: {
                  // this is the /<org base url>/<plugin>/example route
                  example: () => import('./ExampleTitle'),
                },
              },
              mainContent: {
                organization: {
                  // this is the /<org base url>/<plugin>/example route
                  example: () => import('./ExampleOrganizationView'),
                }
              },
          `
          : ''
        }
        // add contributions here
      } satisfies ClientPluginContributions
    `,
  }
}
