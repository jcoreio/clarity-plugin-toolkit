import * as React from 'react'
import { ClientFeatureContributions } from '@jcoreio/clarity-feature-api/client'

export default {
  dashboardWidgets: {
    printStation: {
      displayName: 'printStation',
      component: React.lazy(() => import('./ConnectedPrintStationWidget')),
    },
  },
} satisfies ClientFeatureContributions
