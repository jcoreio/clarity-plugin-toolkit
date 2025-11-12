import semver from 'semver'
import packageJson from './ownPackageJson.ts'

if (!semver.satisfies(process.version, packageJson.engines.node)) {
  // eslint-disable-next-line no-console
  console.error(
    `@jcoreio/clarity-plugin-toolkit requires Node ${packageJson.engines.node}`
  )
  process.exit(1)
}
