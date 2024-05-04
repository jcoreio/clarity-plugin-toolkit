/* eslint-env node, es2018 */
module.exports = {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'master',
    'next',
    'next-major',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
  tagFormat: '@jcoreio/clarity-feature-toolkit-v${version}',
  plugins: [
    [
      require.resolve('@semantic-release/commit-analyzer'),
      {
        preset: 'angular',
        releaseRules: [
          {
            breaking: true,
            scope: '*@jcoreio/clarity-feature-toolkit*',
            release: 'major',
          },
          {
            revert: true,
            scope: '*@jcoreio/clarity-feature-toolkit*',
            release: 'patch',
          },
          {
            type: 'feat',
            scope: '*@jcoreio/clarity-feature-toolkit*',
            release: 'minor',
          },
          {
            type: 'fix',
            scope: '*@jcoreio/clarity-feature-toolkit*',
            release: 'patch',
          },
          {
            type: 'perf',
            scope: '*@jcoreio/clarity-feature-toolkit*',
            release: 'patch',
          },
          { scope: undefined, release: false },
        ],
      },
    ],
    require.resolve('@semantic-release/release-notes-generator'),
    [
      require.resolve('@semantic-release/npm'),
      {
        pkgRoot: require('path').join(__dirname, 'dist'),
      },
    ],
    require.resolve('@semantic-release/github'),
  ],
}
