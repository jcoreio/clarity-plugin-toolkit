import z from 'zod'
import semver from 'semver'

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
    contributes: z.object({
      client: z.string().optional(),
      server: z.string().optional(),
    }),
    dependencies: z
      .object({
        '@jcoreio/clarity-feature-api': z.string(),
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
