import z from 'zod'
import * as React from 'react'
import { CustomDashboardWidgetProps } from './CustomDashboardWidgetProps'

const lazySymbol = React.lazy(() => null as any).$$typeof

type LazyComponentSchema<Props = any> = z.ZodType<
  React.LazyExoticComponent<React.ComponentType<Props>>
>

const LazyComponentSchema = z.unknown().refine(
  (v): v is React.LazyExoticComponent<React.ComponentType> =>
    z
      .object({
        $$typeof: z.literal(lazySymbol),
      })
      .safeParse(v).success,
  'must be a React.lazy exotic component'
)

/**
 * Components and behaviors contributed to the client side of Clarity by a custom feature.
 */
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
          /**
           * The display name shown in the drag source in the side bar for this widget type
           */
          displayName: z.string(),
          /**
           * The React.lazy()-wrapped component for rendering the content of the widget
           */
          component:
            LazyComponentSchema as LazyComponentSchema<CustomDashboardWidgetProps>,
        })
        .optional()
    )
    .optional(),
})
export type ClientFeatureContributions = z.input<
  typeof ClientFeatureContributions
>
