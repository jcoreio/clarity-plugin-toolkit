import * as React from 'react'
import { ClientFeatureContributions } from '../src/client/ClientFeatureContributions'
import { describe, it } from 'mocha'
import { expect } from 'chai'
import { z } from 'zod'

export default function Comp() {
  return <div>Hello world</div>
}

describe(`ClientFeatureSchema`, function () {
  it(`accepts lazy dashboard widget components`, function () {
    ClientFeatureContributions.parse({
      dashboardWidgets: {
        test: {
          displayName: 'Test',
          component: React.lazy(
            () => import('./ClientFeatureContributions.test')
          ),
        },
        test2: undefined,
      },
    } satisfies ClientFeatureContributions)
  })
  it(`rejects non-lazy dashboard widget components`, function () {
    expect(() =>
      ClientFeatureContributions.parse({
        dashboardWidgets: {
          test: {
            displayName: 'Test',
            component: Comp,
          },
          test2: undefined,
        },
      })
    ).to.throw(z.ZodError, 'must be a React.lazy exotic component')
  })
})
