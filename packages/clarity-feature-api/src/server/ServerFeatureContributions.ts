import z from 'zod'
import type { RequestHandler, Request, Response, NextFunction } from 'express'

interface ParsedQs {
  [key: string]: undefined | string | ParsedQs | (string | ParsedQs)[]
}

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
  /**
   * Specifies the location of database migrations provided by this custom feature.
   */
  migrations?: {
    /**
     * The path to the migrations directory
     */
    path: string
    /**
     * If false (default), only include top-level files in the `path` directory matching `pattern`.
     * If true, include files matching the `pattern` in subdirectories of `path`.
     */
    traverseDirectories?: boolean
    /**
     * The pattern for migration files to include
     */
    pattern?: RegExp
  }
}

export const ServerFeatureContributions = z.function(
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
    migrations: z
      .object({
        path: z.string().nonempty(),
        traverseDirectories: z.boolean().default(false),
        pattern: z.instanceof(RegExp).optional(),
      })
      .optional(),
  })
) satisfies z.ZodType<
  ServerFeatureContributions,
  any,
  ServerFeatureContributions
>
