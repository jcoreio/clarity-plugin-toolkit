import * as React from 'react'
import { ClientPluginContributions } from '@jcoreio/clarity-plugin-api/client'

export default {
  dashboardWidgets: {
    printStation: {
      displayName: 'printStation',
      component: React.lazy(() => import('./ConnectedPrintStationWidget')),
    },
  },
} satisfies ClientPluginContributions
