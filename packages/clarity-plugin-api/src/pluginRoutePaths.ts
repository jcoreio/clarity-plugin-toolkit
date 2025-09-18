/* eslint-disable @typescript-eslint/no-unused-vars */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
class PluginRouteStub<Params extends {}> {
  /**
   * Parses the given URL pathname.
   * @param path the URL pathname to parse
   * @returns the parsed path params
   * @throws if `pathname` doesn't match this route
   */
  parse(pathname: string): Params {
    throw new Error(
      'this is a stub for the implementation that will be provided by Clarity'
    )
  }
  /**
   * Creates the URL pathname for the given params
   * @param params the parameter values to format
   * @returns the formatted URL pathname
   */
  format(params: Params): string {
    throw new Error(
      'this is a stub for the implementation that will be provided by Clarity'
    )
  }
  /**
   * Creates the URL pathname pattern for the given params.
   * @param params the parameter values to format
   * @returns the URL pathname pattern.  If a value for a parameter like `plugin`
   * is omitted, that part of the pattern will be left as `:plugin` instead of being
   * replaced by the parameter value.
   */
  partialFormat(params: Partial<Params>): string {
    throw new Error(
      'this is a stub for the implementation that will be provided by Clarity'
    )
  }
}

/**
 * The base path for plugins' API routes
 */
export const apiBasePath = new PluginRouteStub<{ plugin: string }>()
/**
 * The base path for plugins' UI routes that aren't under the base path for an organization
 */
export const uiBasePath = new PluginRouteStub<{ plugin: string }>()
/**
 * The base path for plugins' UI routes under the base path for an organization
 */
export const organizationUIBasePath = new PluginRouteStub<{
  organizationId: number
  plugin: string
}>()
