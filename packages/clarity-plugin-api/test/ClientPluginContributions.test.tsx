import * as React from 'react'
import { ClientPluginContributions } from '../src/client/ClientPluginContributions'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import { z } from 'zod'

export default function Comp() {
  return <div>Hello world</div>
}

describe(`ClientPluginSchema`, function () {
  it(`accepts valid dashboard component loaders`, function () {
    ClientPluginContributions.parse({
      dashboardWidgets: {
        test: {
          displayName: 'Test',
          component: () => import('./ClientPluginContributions.test'),
        },
        test2: undefined,
      },
    } satisfies ClientPluginContributions)
  })
  it(`rejects invalid dashboard widget components`, async function () {
    for (const component of [
      Comp,
      async () => ({ component: Comp }),
      async () => Comp,
    ]) {
      await expect(
        ClientPluginContributions.parse({
          dashboardWidgets: {
            test: {
              displayName: 'Test',
              component,
            },
            test2: undefined,
          },
        }).dashboardWidgets?.test?.component()
      ).be.rejectedWith(z.ZodError, 'Invalid function return type')
    }
  })
})
