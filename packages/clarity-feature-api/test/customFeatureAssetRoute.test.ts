import { describe, it } from 'mocha'
import { expect } from 'chai'
import { customFeatureAssetRoute } from '../src'

describe(`customFeatureAssetRoute`, function () {
  it(`parse`, function () {
    expect(
      customFeatureAssetRoute.parse(
        `/customfeatureassets/${encodeURIComponent(
          '@jcoreio/my-feature'
        )}/1.0.0-beta.1/client/entry.js`
      )
    ).to.deep.equal({
      feature: '@jcoreio/my-feature',
      version: '1.0.0-beta.1',
      environment: 'client',
      filename: 'entry.js',
    })
    expect(
      customFeatureAssetRoute.parse(
        `/customfeatureassets/${encodeURIComponent(
          '@jcoreio/my-feature'
        )}/1.0.0-beta.1/client/foo%2Fentry.js`
      )
    ).to.deep.equal({
      feature: '@jcoreio/my-feature',
      version: '1.0.0-beta.1',
      environment: 'client',
      filename: 'foo/entry.js',
    })
  })
  it(`format`, function () {
    expect(
      customFeatureAssetRoute.format({
        feature: '@jcoreio/my-feature',
        version: '1.0.0-beta.1',
        environment: 'client',
        filename: 'entry.js',
      })
    ).to.equal(
      `/customfeatureassets/${encodeURIComponent(
        '@jcoreio/my-feature'
      )}/1.0.0-beta.1/client/entry.js`
    )
    expect(
      customFeatureAssetRoute.format({
        feature: '@jcoreio/my-feature',
        version: '1.0.0-beta.1',
        environment: 'client',
        filename: 'foo/entry.js',
      })
    ).to.equal(
      `/customfeatureassets/${encodeURIComponent(
        '@jcoreio/my-feature'
      )}/1.0.0-beta.1/client/foo%2Fentry.js`
    )
  })
})
