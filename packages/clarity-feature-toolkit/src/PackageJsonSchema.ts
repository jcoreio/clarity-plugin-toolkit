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
    contributes: DeployClarityFeaturePackageJson.shape.contributes,
    dependencies: z
      .object({
        '@jcoreio/clarity-feature-api': z.string(),
      })
      .catchall(z.string()),
    devDependencies: z.object({}).catchall(z.string()).optional(),
    clarity: z
      .object({
        url: z.string().optional(),
        signatureVerificationKeyId: z.number().optional(),
      })
      .optional(),
  })
  .passthrough()
