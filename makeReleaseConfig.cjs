/* eslint-env node, es2018 */
const path = require('path')
module.exports = function makeReleaseConfig(pkgDir) {
  const pkg = require(path.resolve(pkgDir, 'package.json')).name
  const otherPackages = require('glob')
    .sync('*/package.json', { cwd: __dirname })
    .map((f) => require(path.resolve(__dirname, f)).name)

  return {
    branches: [
      '+([0-9])?(.{+([0-9]),x}).x',
      'master',
      'next',
      'next-major',
      { name: 'beta', prerelease: true },
      { name: 'alpha', prerelease: true },
    ],
    tagFormat: `${pkg}-v\${version}`,
    plugins: [
      [
        require.resolve('@semantic-release/commit-analyzer'),
        {
          preset: 'conventionalcommits',
          releaseRules: [
            ...[pkg, undefined].flatMap((scope) => [
              { breaking: true, scope, release: 'major' },
              { revert: true, scope, release: 'patch' },
              { type: 'feat', scope, release: 'minor' },
              { type: 'fix', scope, release: 'patch' },
              { type: 'perf', scope, release: 'patch' },
            ]),
            { scope: undefined, release: false },
          ],
        },
      ],
      [
        require.resolve('@semantic-release/release-notes-generator'),
        {
          preset: 'conventionalcommits',
          presetConfig: {
            types: [
              { type: 'build', section: 'Build System', hidden: true },
              { type: 'chore', section: 'Build System', hidden: true },
              { type: 'ci', section: 'Continuous Integration', hidden: true },
              { type: 'style', section: 'Styles', hidden: true },
              { type: 'test', section: 'Tests', hidden: true },
              ...[
                { type: 'docs', section: 'Documentation' },
                { type: 'feat', section: 'Features' },
                { type: 'fix', section: 'Bug Fixes' },
                { type: 'perf', section: 'Performance Improvements' },
                { type: 'refactor', section: 'Code Refactoring' },
              ].flatMap((cfg) => [
                { ...cfg, scope: pkg, hidden: false },
                ...otherPackages.map((otherPkg) => ({
                  ...cfg,
                  scope: otherPkg,
                  hidden: true,
                })),
                { ...cfg, hidden: false },
              ]),
            ],
          },
        },
      ],
      [
        require.resolve('@semantic-release/npm'),
        {
          pkgRoot: path.join(pkgDir, 'dist'),
        },
      ],
      require.resolve('@semantic-release/github'),
    ],
  }
}
