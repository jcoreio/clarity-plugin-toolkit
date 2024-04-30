import semver from 'semver'

// @ts-expect-error ignore this
import { engines } from '@jcoreio/clarity-feature-toolkit/package.json'

if (!semver.satisfies(process.version, engines.node)) {
  // eslint-disable-next-line no-console
  console.error(
    `@jcoreio/clarity-feature-toolkit requires Node ${engines.node}`
  )
  process.exit(1)
}
