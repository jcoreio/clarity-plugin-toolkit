import * as React from 'react'
export default {
  dashboardWidgets: {
    printStation: {
      displayName: 'Print Station',
      component: React.lazy(() => import('../src/ConnectedPrintStationWidget.tsx'))
    }
  }
}