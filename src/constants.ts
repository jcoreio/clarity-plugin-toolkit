import z from 'zod'
import ZodRoute from 'zod-route-schemas'

const tempDir = './node_modules/.clarity-feature-toolkit'

export const emptyEntryFile = `${tempDir}/empty.js`
export const clientEntrypointFile = `${tempDir}/client.js`
export const clarityApiTokenFile = `${tempDir}/clarity-api-token`

export const customFeatureAssetPath = new ZodRoute(
  '/assets/customfeatures/:filename',
  z.strictObject({
    filename: z.string().regex(/^[^/]+$/g),
  })
)
