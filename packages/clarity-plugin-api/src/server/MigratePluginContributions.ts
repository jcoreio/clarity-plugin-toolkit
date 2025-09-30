import z from 'zod'

// we declare this manually instead of using `z.input<typeof MigratePluginContributions>` because
// the JSDoc gets lost in .d.ts files
/**
 * Behaviors contributed to the server side migrate task of Clarity by a plugin.
 */
export type MigratePluginContributions = () => {
  /**
   * Specifies the location of database migrations provided by this plugin.
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

export const MigratePluginContributions = z.function(
  z.tuple([]),
  z.object({
    migrations: z
      .object({
        path: z.string().nonempty(),
        traverseDirectories: z.boolean().default(false),
        pattern: z.instanceof(RegExp).optional(),
      })
      .optional(),
  })
) satisfies z.ZodType<
  MigratePluginContributions,
  any,
  MigratePluginContributions
>
