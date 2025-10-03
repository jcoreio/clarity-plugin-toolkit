import { type ClientPluginContributions } from "@jcoreio/clarity-plugin-api/client";

export default {
  dashboardWidgets: {
    exampleWidget: {
      displayName: "Example Widget",
      component: () => import("./ExampleWidget"),
    },
  },
  sidebarSections: () => import("./ExampleSidebarItem"),
  navbarTitle: {
    organization: {
      // this is the /<org base url>/<plugin>/example route
      example: () => import("./ExampleTitle"),
    },
  },
  mainContent: {
    organization: {
      // this is the /<org base url>/<plugin>/example route
      example: () => import("./ExampleOrganizationView"),
    },
  },
  // add contributions here
} satisfies ClientPluginContributions;
