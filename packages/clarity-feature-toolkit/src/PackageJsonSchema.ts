import z from 'zod'
import semver from 'semver'
import { ContributesSchema } from '@jcoreio/clarity-feature-api'

const Version = z
  .string()
  .refine(
    (version) => semver.valid(version),
    'must be a valid semantic version'
  )

const VersionRange = z
  .string()
  .refine(
    (range) => semver.validRange(range),
    'must be a valid semantic version range'
  )

export const PackageJsonSchema = z
  .object({
    name: z.string(),
    version: Version,
    contributes: ContributesSchema,
    dependencies: z
      .object({
        '@jcoreio/clarity-feature-api': VersionRange,
      })
      .catchall(z.string()),
    clarity: z
      .object({
        url: z.string().optional(),
        signatureVerificationKeyId: z.number().optional(),
      })
      .optional(),
  })
  .passthrough()
