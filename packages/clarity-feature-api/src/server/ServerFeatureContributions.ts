import z from 'zod'
import { RequestHandler } from 'express'

// we declare this manually instead of using `z.input<typeof ServerFeatureContributions>` because
// the JSDoc gets lost in .d.ts files
/**
 * Components and behaviors contributed to the server side of Clarity by a custom feature.
 */
export type ServerFeatureContributions = () => {
  /**
   * An API request handler for this feature (optional)
   */
  api?: RequestHandler
}

export const ServerFeatureContributions = z.function(
  z.tuple([]),
  z.object({
    api: z.function().optional(),
  })
) satisfies z.ZodType<
  ServerFeatureContributions,
  any,
  ServerFeatureContributions
>
