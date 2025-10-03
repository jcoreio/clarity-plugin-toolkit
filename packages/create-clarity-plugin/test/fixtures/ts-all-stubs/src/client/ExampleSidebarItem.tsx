import * as React from "react";
import {
  SidebarSection,
  useOrganizationId,
  organizationUIBasePath,
} from "@jcoreio/clarity-plugin-api/client";
import pluginPackageJson from "../../package.json" with { type: "json" };
const { name: plugin } = pluginPackageJson;

export default function ExampleSidebarItem() {
  const organizationId = useOrganizationId({ optional: true });
  if (organizationId == null) return null;
  return (
    <SidebarSection
      title="Plugin Example"
      headerProps={{
        to: `${organizationUIBasePath.format({ organizationId, plugin })}/example`,
      }}
    />
  );
}
