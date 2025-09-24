import * as React from 'react'
import { useCurrentPluginRoute } from '@jcoreio/clarity-plugin-api/client'
import { BrowserRouter, Route, Routes } from 'react-router'

export default function MainOrganizationContent() {
  const { basePath, organizationId } = useCurrentPluginRoute()
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={`${basePath}/test`}
          element={
            <div
              data-component="TestPluginMainOrganizationContent"
              data-organization-id={organizationId}
            >
              Test! Organization ID: {organizationId}
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
