/**
 * Information about the URL path of a plugin route
 */
export type PluginRouteInfo = {
  /**
   * If the route is within a specific organization, this is the id of the organization
   */
  organizationId?: number
  /**
   * The name of the plugin that provided the route
   */
  plugin: string
  /**
   * If `organizationId` is defined, this is the base URL path for the plugin's routes within that
   * organization; otherwise this is the base path for the plugin's routes outside of
   * any organization.
   */
  rawBasePath: string
  /**
   * The same as `rawBasePath` except this will not contain any URL-encoded characters in path
   * elements except for `/`.
   */
  basePath: string
  /**
   * The rest of the URL path after `rawBasePath`.
   */
  rawSubpath: string
  /**
   * The same as `rawSubpath` except this will not contain any URL-encoded characters in path
   * elements except for `/`.
   */
  subpath: string
}

/**
 * @returns information about the plugin route associated with the current `location.pathname`.
 * @throws if `location.pathname` is not a plugin route or subroute
 */
export function useCurrentPluginRoute(): PluginRouteInfo {
  throw new Error(
    'this is a stub for the implementation that will be provided by Clarity'
  )
}
