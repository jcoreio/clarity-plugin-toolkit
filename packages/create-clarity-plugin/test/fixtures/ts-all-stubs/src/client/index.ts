import { type ClientPluginContributions } from "@jcoreio/clarity-plugin-api/client";

export default {
  dashboardWidgets: {
    exampleWidget: {
      displayName: "Example Widget",
      component: () => import("./ExampleWidget.js"),
    },
  },
  sidebarSections: () => import("./ExampleSidebarItem.js"),
  navbarTitle: {
    organization: {
      // this is the /<org base url>/<plugin>/example route
      example: () => import("./ExampleTitle.js"),
    },
  },
  mainContent: {
    organization: {
      // this is the /<org base url>/<plugin>/example route
      example: () => import("./ExampleOrganizationView.js"),
    },
  },
  // add contributions here
} satisfies ClientPluginContributions;
