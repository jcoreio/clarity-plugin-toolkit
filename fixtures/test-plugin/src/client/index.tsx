import type { ClientPluginContributions } from '@jcoreio/clarity-plugin-api/client'

export default {
  dashboardWidgets: {
    testDashboardWidget: {
      displayName: 'Test Dashboard Widget',
      component: () => import('./TestDashboardWidget'),
    },
  },
  sidebarSections: () => import('./TestSidebarSections'),
  navbarTitle: {
    organization: {
      test: () => import('./TestTitle'),
    },
  },
  mainContent: {
    organization: () => import('./MainOrganizationContent'),
  },
} satisfies ClientPluginContributions
