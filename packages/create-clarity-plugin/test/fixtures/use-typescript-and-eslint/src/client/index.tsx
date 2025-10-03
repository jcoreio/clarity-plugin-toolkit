import { type ClientPluginContributions } from "@jcoreio/clarity-plugin-api/client";

export default {
  dashboardWidgets: {
    exampleWidget: {
      displayName: "Example Widget",
      component: () => import("./ExampleWidget"),
    },
  },

  // add contributions here
} satisfies ClientPluginContributions;
