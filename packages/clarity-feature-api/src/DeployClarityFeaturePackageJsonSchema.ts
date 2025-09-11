import z from 'zod'

export type ExportsObject = { [key in string]?: string | ExportsObject }

const ExportsObject: z.ZodType<ExportsObject, any, ExportsObject> = z.record(
  z.string(),
  z.union([z.string(), z.lazy(() => ExportsObject)]).optional()
)

export type DeployClarityFeaturePackageJson = {
  /**
   * The name of the custom feature package
   */
  name: string
  /**
   * The version of the custom feature package
   */
  version: string
  dependencies?: { [name in string]?: string }
  devDependencies?: { [name in string]?: string }
  /**
   * The export map.  Clarity supports the following export paths:
   * - ./webapp - the entrypoint to contribute functionality to the webapp task
   *
   * These will be processed by clarity-feature-toolkit and replaced in
   * the package.json deployed to Clarity.
   */
  exports?: ExportsObject
  /**
   * Other Clarity-specific properties
   */
  clarity?: {
    /**
     * The id of the signature verification key to use
     */
    signatureVerificationKeyId: number
    /**
     * Properties for the client side feature contributions
     */
    client?: {
      /**
       * Paths to client entrypoints relative to the package root.
       * These will be processed by webpack and replaced in the
       * package.json deployed to Clarity.
       */
      entrypoints: string[]
    }
  }
}

/**
 * The package.json schema for a feature deployed to Clarity.
 * It contains some fields that are added by clarity-feature-toolkit.
 */
export const DeployClarityFeaturePackageJson = z
  .object({
    name: z.string(),
    version: z.string(),
    dependencies: z.record(z.string()).optional(),
    devDependencies: z.record(z.string()).optional(),
    exports: ExportsObject.optional(),
    clarity: z.object({
      signatureVerificationKeyId: z.number(),
      client: z
        .object({
          entrypoints: z.array(z.string()),
        })
        .optional(),
    }),
  })
  .passthrough() satisfies z.ZodType<
  DeployClarityFeaturePackageJson,
  any,
  DeployClarityFeaturePackageJson
>
