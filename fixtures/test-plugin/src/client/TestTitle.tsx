import * as React from 'react'
import { useOrganizationId } from '@jcoreio/clarity-plugin-api/client'

export default function TestTitle() {
  const organizationId = useOrganizationId()
  return (
    <div data-component="TestPluginTitle">
      Test! Organization ID: {organizationId}
    </div>
  )
}
