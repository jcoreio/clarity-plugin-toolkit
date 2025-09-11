import z from 'zod'
import semver from 'semver'
import { DeployClarityFeaturePackageJson } from '@jcoreio/clarity-feature-api'

const Version = z
  .string()
  .refine(
    (version) => semver.valid(version),
    'must be a valid semantic version'
  )

export const PackageJsonSchema = z
  .object({
    name: z.string(),
    version: Version,
    exports: DeployClarityFeaturePackageJson.shape.exports,
    dependencies: z
      .object({
        '@jcoreio/clarity-feature-api': z.string(),
      })
      .catchall(z.string()),
    devDependencies: z.object({}).catchall(z.string()).optional(),
    clarity: DeployClarityFeaturePackageJson.shape.clarity
      .extend({
        url: z.string().optional(),
      })
      .partial()
      .optional(),
  })
  .passthrough()
