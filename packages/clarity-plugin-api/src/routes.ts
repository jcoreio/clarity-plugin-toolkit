import ZodRoute from 'zod-route-schemas'
import z from 'zod'
import semver from 'semver'

export const pluginAssetRoute = new ZodRoute(
  '/pluginassets/:plugin/:version/:environment/:filename',
  z.strictObject({
    plugin: z.string().transform((s) => decodeURIComponent(s)),
    version: z.string().refine((version) => semver.valid(version)),
    environment: z.enum(['client', 'server']),
    filename: z.string().transform((s) => s.replace(/^\.?\/?/, '')),
  }),
  {
    formatSchema: z.strictObject({
      plugin: z.string(),
      version: z.string().refine((version) => semver.valid(version)),
      environment: z.enum(['client', 'server']),
      filename: z.string().transform((s) => s.replace(/^\.?\/?/, '')),
    }),
  }
)
