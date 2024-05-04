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
  tagFormat: 'create-clarity-feature-v${version}',
  plugins: [
    [
      require.resolve('@semantic-release/commit-analyzer'),
      {
        preset: 'angular',
        releaseRules: [
          {
            breaking: true,
            scope: '*create-clarity-feature*',
            release: 'major',
          },
          {
            revert: true,
            scope: '*create-clarity-feature*',
            release: 'patch',
          },
          {
            type: 'feat',
            scope: '*create-clarity-feature*',
            release: 'minor',
          },
          {
            type: 'fix',
            scope: '*create-clarity-feature*',
            release: 'patch',
          },
          {
            type: 'perf',
            scope: '*create-clarity-feature*',
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
