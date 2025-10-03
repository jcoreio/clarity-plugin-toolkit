export default {
  dashboardWidgets: {
    exampleWidget: {
      displayName: "Example Widget",
      component: () => import("./ExampleWidget.jsx"),
    },
  },
  sidebarSections: () => import("./ExampleSidebarItem.jsx"),
  navbarTitle: {
    organization: {
      // this is the /<org base url>/<plugin>/example route
      example: () => import("./ExampleTitle.jsx"),
    },
  },
  mainContent: {
    organization: {
      // this is the /<org base url>/<plugin>/example route
      example: () => import("./ExampleOrganizationView.jsx"),
    },
  },
  // add contributions here
};
