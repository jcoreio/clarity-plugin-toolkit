const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = async (args = []) => {
  await execa('pnpm', [
    'install',
    '-D',
    '--no-optional',
    '@semantic-release/commit-analyzer@^12.0.0',
    '@semantic-release/github@^10.0.3',
    '@semantic-release/npm@^12.0.0',
    '@semantic-release/release-notes-generator@^13.0.0',
    'semantic-release@^23.0.8',
    'semantic-release-monorepo@^8.0.2',
  ])
  await execa('semantic-release', ['-e', 'semantic-release-monorepo', ...args])
}
