import z from 'zod'

/**
 * The package.json schema for a feature deployed to Clarity.
 * It contains some fields that are added by clarity-feature-toolkit.
 */
export const DeployClarityFeaturePackageJson = z
  .object({
    name: z.string(),
    version: z.string(),
    organization: z.string().optional(),
    dependencies: z.record(z.string()).optional(),
    devDependencies: z.record(z.string()).optional(),
    contributes: z.object({
      client: z.string().optional(),
      server: z.string().optional(),
    }),
    client: z
      .object({
        entrypoints: z.array(z.string()),
      })
      .optional(),
    server: z
      .object({
        tarball: z.string(),
      })
      .optional(),
    clarity: z.object({
      signatureVerificationKeyId: z.number(),
    }),
  })
  .passthrough()

export type DeployClarityFeaturePackageJson = z.output<
  typeof DeployClarityFeaturePackageJson
>
