import ZodRoute from 'zod-route-schemas'
import z from 'zod'
import semver from 'semver'

const filename = z
  .string()
  .refine(
    (s) => !s.startsWith('/') && !/(^|[\\/])\.\.([\\/]|$)/.test(s),
    'must be a relative path without .. segments'
  )
  .transform((s) => s.replace(/^\.?\/?/, ''))

export const pluginAssetRoute = new ZodRoute(
  '/pluginassets/:plugin/:version/:environment/:filename',
  z.strictObject({
    plugin: z.string().transform((s) => decodeURIComponent(s)),
    version: z.string().refine((version) => semver.valid(version)),
    environment: z.enum(['client', 'server']),
    filename,
  }),
  {
    formatSchema: z.strictObject({
      plugin: z.string(),
      version: z.string().refine((version) => semver.valid(version)),
      environment: z.enum(['client', 'server']),
      filename,
    }),
  }
)
