import z from 'zod'
import semver from 'semver'
import { ClarityPluginPackageJson } from '@jcoreio/clarity-plugin-api'

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
    exports: ClarityPluginPackageJson.shape.exports,
    dependencies: z
      .object({
        '@jcoreio/clarity-plugin-api': z.string(),
      })
      .catchall(z.string()),
    devDependencies: z.object({}).catchall(z.string()).optional(),
    clarity: ClarityPluginPackageJson.shape.clarity
      .extend({
        url: z.string().optional(),
      })
      .partial()
      .optional(),
  })
  .passthrough()
