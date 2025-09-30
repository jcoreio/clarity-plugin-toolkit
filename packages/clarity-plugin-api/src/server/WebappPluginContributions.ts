import z from 'zod'
import type { RequestHandler, Request, Response, NextFunction } from 'express'

interface ParsedQs {
  [key: string]: undefined | string | ParsedQs | (string | ParsedQs)[]
}

// we declare this manually instead of using `z.input<typeof WebappPluginContributions>` because
// the JSDoc gets lost in .d.ts files
/**
 * Components and behaviors contributed to the server side webapp task of Clarity by a plugin.
 */
export type WebappPluginContributions = () => {
  /**
   * An API request handler for this plugin (optional)
   */
  api?: RequestHandler
}

export const WebappPluginContributions = z.function(
  z.tuple([]),
  z.object({
    api: z
      .function(
        z.tuple([
          z.any() as z.ZodType<
            // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unnecessary-type-arguments
            Request<{}, any, any, ParsedQs, Record<string, any>>
          >,
          z.any() as z.ZodType<Response>,
          z.any() as z.ZodType<NextFunction>,
        ]),
        z.void()
      )
      .optional(),
  })
) satisfies z.ZodType<WebappPluginContributions, any, WebappPluginContributions>
