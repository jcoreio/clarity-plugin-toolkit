import { ClientPluginContributions } from '@jcoreio/clarity-plugin-api/client'

export default {
  dashboardWidgets: {
    printStation: {
      displayName: 'printStation',
      component: () => import('./ConnectedPrintStationWidget'),
    },
  },
} satisfies ClientPluginContributions
