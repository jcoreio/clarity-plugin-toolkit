import { describe, it } from 'mocha'
import { expect } from 'chai'
import { pluginAssetRoute } from '../src'

describe(`pluginAssetRoute`, function () {
  it(`parse`, function () {
    expect(
      pluginAssetRoute.parse(
        `/pluginassets/${encodeURIComponent(
          '@jcoreio/my-plugin'
        )}/1.0.0-beta.1/client/entry.js`
      )
    ).to.deep.equal({
      plugin: '@jcoreio/my-plugin',
      version: '1.0.0-beta.1',
      environment: 'client',
      filename: 'entry.js',
    })
    expect(
      pluginAssetRoute.parse(
        `/pluginassets/${encodeURIComponent(
          '@jcoreio/my-plugin'
        )}/1.0.0-beta.1/client/foo%2Fentry.js`
      )
    ).to.deep.equal({
      plugin: '@jcoreio/my-plugin',
      version: '1.0.0-beta.1',
      environment: 'client',
      filename: 'foo/entry.js',
    })
  })
  it(`format`, function () {
    expect(
      pluginAssetRoute.format({
        plugin: '@jcoreio/my-plugin',
        version: '1.0.0-beta.1',
        environment: 'client',
        filename: 'entry.js',
      })
    ).to.equal(
      `/pluginassets/${encodeURIComponent(
        '@jcoreio/my-plugin'
      )}/1.0.0-beta.1/client/entry.js`
    )
    expect(
      pluginAssetRoute.format({
        plugin: '@jcoreio/my-plugin',
        version: '1.0.0-beta.1',
        environment: 'client',
        filename: 'foo/entry.js',
      })
    ).to.equal(
      `/pluginassets/${encodeURIComponent(
        '@jcoreio/my-plugin'
      )}/1.0.0-beta.1/client/foo%2Fentry.js`
    )
  })
})
