import * as React from "react";
import {
  SidebarSection,
  useOrganizationId,
  organizationUIBasePath,
} from "@jcoreio/clarity-plugin-api/client";
import { name as plugin } from "../../package.json";

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
