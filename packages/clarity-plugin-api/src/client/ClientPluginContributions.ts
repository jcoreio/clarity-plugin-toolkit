/* eslint-disable @typescript-eslint/no-empty-object-type */
import z from 'zod'
import * as React from 'react'
import { DashboardWidgetProps } from './DashboardWidgetProps'

/**
 * An async function that loads a React component (the argument to {@link React.lazy})
 */
export type ComponentLoader<Props = {}> = () => Promise<{
  default: React.ComponentType<Props>
}>
export const ComponentLoader = <Props = {}>() =>
  z.function(
    z.tuple([]),
    z.promise(
      z.object({
        default: z.function() as any as z.ZodType<React.ComponentType<Props>>,
      })
    )
  )

/**
 * A mapping from relative URL route paths to {@link ComponentLoader}s.
 */
export type ComponentLoaderRoutes = { [Route in string]?: ComponentLoader }
export const ComponentLoaderRoutes = z.record(
  z.string(),
  ComponentLoader().optional()
)

type ComponentLoaderOrRoutes = ComponentLoader | ComponentLoaderRoutes
const ComponentLoaderOrRoutes = z.union([
  ComponentLoader(),
  ComponentLoaderRoutes,
])

// we declare this manually instead of using `z.input<typeof ClientPluginContributions>` because
// the JSDoc gets lost in .d.ts files
/**
 * Components and behaviors contributed to the client side of Clarity by a plugin.
 */
export type ClientPluginContributions = {
  /**
   * Dashboard widget types to add to Clarity.  The key is the unique
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
      component: ComponentLoader<DashboardWidgetProps>
    }
  }
  /**
   * A component to render in the sidebar
   */
  sidebarSections?: ComponentLoader
  /**
   * The order of `sidebarContent` relative to other elements in the sidebar
   */
  sidebarSectionsOrder?: number
  /**
   * Components to render in the navbar title within routes for this plugin
   */
  navbarTitle?: {
    /**
     * A component to render in the navbar title within non-organization routes
     * for this plugin (including when the user isn't logged in)
     */
    root?: ComponentLoaderOrRoutes
    /**
     * A component to render in the navbar title within organization routes for
     * this plugin
     */
    organization?: ComponentLoaderOrRoutes
  }
  /**
   * Components to render in the main content area within routes for this plugin
   */
  mainContent?: {
    /**
     * A component to render in the main content area within non-organization routes
     * for this plugin (including when the user isn't logged in)
     */
    root?: ComponentLoaderOrRoutes
    /**
     * A component to render in the main content area within organization routes for
     * this plugin
     */
    organization?: ComponentLoaderOrRoutes
  }

  // userMenuItems?: Content<UserMenuProps, React.ReactNode>
  // tagContextMenuItems?: Content<TagContextMenuProps, React.ReactNode>
  // tagContextMenuItemsOrder?: number
  // adminLinks?: Components<AdminLinksProps>
  // adminLinksOrder?: number
}

export const ClientPluginContributions = z.strictObject({
  /**
   * Dashboard widget types to add to Clarity.  The key is the unique
   * `customVariant` stored in the dashboard config.
   */
  dashboardWidgets: z
    .record(
      z.string(),
      z
        .strictObject({
          displayName: z.string(),
          component: ComponentLoader<DashboardWidgetProps>(),
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
  ClientPluginContributions,
  any,
  ClientPluginContributions
>
