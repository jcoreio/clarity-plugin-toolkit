import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function clientIndex({ stubs, useTypescript }: TemplateOptions) {
  if (
    !stubs?.includes('dashboardWidget') &&
    !stubs?.includes('organizationView') &&
    !stubs?.includes('sidebarItem')
  ) {
    return {}
  }
  const jsxExtension = useTypescript ? 'js' : 'jsx'
  return {
    'src/client/index.ts': dedent`
      import { type ClientPluginContributions } from '@jcoreio/clarity-plugin-api/client'

      export default {
        ${
          stubs.includes('dashboardWidget') ?
            dedent`
              dashboardWidgets: {
                exampleWidget: {
                  displayName: 'Example Widget',
                  component: () => import('./ExampleWidget.${jsxExtension}'),
                },
              },
            `
          : ''
        }
        ${
          stubs.includes('sidebarItem') ?
            dedent`
              sidebarSections: () => import('./ExampleSidebarItem.${jsxExtension}'),
            `
          : ''
        }
        ${
          stubs.includes('organizationView') ?
            dedent`
              navbarTitle: {
                organization: {
                  // this is the /<org base url>/<plugin>/example route
                  example: () => import('./ExampleTitle.${jsxExtension}'),
                },
              },
              mainContent: {
                organization: {
                  // this is the /<org base url>/<plugin>/example route
                  example: () => import('./ExampleOrganizationView.${jsxExtension}'),
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
