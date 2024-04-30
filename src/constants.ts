import z from 'zod'
import ZodRoute from 'zod-route-schemas'

export const emptyEntryFile = './node_modules/.clarity-feature-api/empty.js'

export const clientEntrypointFile =
  './node_modules/.clarity-feature-api/client.js'

export const customFeatureAssetPath = new ZodRoute(
  '/assets/customfeatures/:filename',
  z.strictObject({
    filename: z.string().regex(/^[^/]+$/g),
  })
)
