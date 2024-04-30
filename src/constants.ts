import z from 'zod'
import ZodRoute from 'zod-route-schemas'

export const featureEntrypointFile =
  './node_modules/.clarity-feature-api/feature.js'

export const customFeatureAssetPath = new ZodRoute(
  '/assets/customfeatures/:filename',
  z.strictObject({
    filename: z.string().regex(/^[^/]+$/g),
  })
)
