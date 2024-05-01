import semver from 'semver'
import packageJson from './ownPackageJson'

if (!semver.satisfies(process.version, packageJson.engines.node)) {
  // eslint-disable-next-line no-console
  console.error(
    `@jcoreio/clarity-feature-toolkit requires Node ${packageJson.engines.node}`
  )
  process.exit(1)
}
