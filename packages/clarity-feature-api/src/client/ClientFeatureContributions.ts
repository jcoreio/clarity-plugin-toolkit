import z from 'zod'
import * as React from 'react'
import { CustomDashboardWidgetProps } from './CustomDashboardWidgetProps'

/**
 * A function that imports a React component module (the argument to {@link React.lazy})
 */
export type ComponentLoader<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  P extends {} = {},
> = () => Promise<{
  default: React.ComponentType<P>
}>

/**
 * A set of URL route -> {@link ComponentLoader} pairs.
 */
export type ComponentLoaderRoutes = { [Route in string]?: ComponentLoader }

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const ComponentLoader = <P extends {} = {}>() =>
  z.function(
    z.tuple([]),
    z.promise(
      z.object({ default: z.any() as z.ZodType<React.ComponentType<P>> })
    )
  ) satisfies z.ZodType<ComponentLoader<P>>

// we declare this manually instead of using `z.input<typeof ClientFeatureContributions>` because
// the JSDoc gets lost in .d.ts files
/**
 * Components and behaviors contributed to the client side of Clarity by a custom feature.
 */
export type ClientFeatureContributions = {
  /**
   * Custom dashboard widget types to add to Clarity.  The key is the unique
   * `customVariant` stored in the dashboard config.
   */
  dashboardWidgets?: {
    [customVariant in string]?: {
      /**
       * The display name shown in the drag source in the side bar for this widget type
       */
      displayName: string
      /**
       * The component loader for rendering the content of the widget
       */
      component: ComponentLoader<CustomDashboardWidgetProps>
    }
  }
  /**
   * A component to render in the sidebar
   */
  sidebarSections?: ComponentLoader
  /**
   * The order of `sidebarContent` relative to other elements
   * in the sidebar
   */
  sidebarSectionsOrder?: number
  /**
   * Components to render in the navbar title within routes for this feature
   */
  navbarTitle?: {
    /**
     * A component to render in the navbar title within non-organization routes
     * for this feature (including when the user isn't logged in)
     */
    root?: ComponentLoader | ComponentLoaderRoutes
    /**
     * A component to render in the navbar title within organization routes for
     * this feature
     */
    organization?: ComponentLoader | ComponentLoaderRoutes
  }
  /**
   * Components to render in the main content area within routes for this feature
   */
  mainContent?: {
    /**
     * A component to render in the main content area within non-organization routes
     * for this feature (including when the user isn't logged in)
     */
    root?: ComponentLoader | ComponentLoaderRoutes
    /**
     * A component to render in the main content area within organization routes for
     * this feature
     */
    organization?: ComponentLoader | ComponentLoaderRoutes
  }

  // userMenuItems?: Content<UserMenuProps, React.ReactNode>
  // tagContextMenuItems?: Content<TagContextMenuProps, React.ReactNode>
  // tagContextMenuItemsOrder?: number
  // adminLinks?: Components<AdminLinksProps>
  // adminLinksOrder?: number
}

const ComponentLoaderOrRoutes = z.union([
  ComponentLoader(),
  z.record(
    z.string().regex(/^[^/]/, 'subroute must not start with /'),
    ComponentLoader().optional()
  ),
])

export const ClientFeatureContributions = z.strictObject({
  /**
   * Custom dashboard widget types to add to Clarity.  The key is the unique
   * `customVariant` stored in the dashboard config.
   */
  dashboardWidgets: z
    .record(
      z.string(),
      z
        .strictObject({
          displayName: z.string(),
          component: ComponentLoader<CustomDashboardWidgetProps>(),
        })
        .optional()
    )
    .optional(),
  sidebarSections: ComponentLoader().optional(),
  sidebarSectionsOrder: z.number().optional(),
  navbarTitle: z
    .object({
      root: ComponentLoaderOrRoutes.optional(),
      organization: ComponentLoaderOrRoutes.optional(),
    })
    .optional(),
  mainContent: z
    .object({
      root: ComponentLoaderOrRoutes.optional(),
      organization: ComponentLoaderOrRoutes.optional(),
    })
    .optional(),
}) satisfies z.ZodType<
  ClientFeatureContributions,
  any,
  ClientFeatureContributions
>
