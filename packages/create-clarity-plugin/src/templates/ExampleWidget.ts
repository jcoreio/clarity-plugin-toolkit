import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function ExampleWidget({ stubs }: TemplateOptions) {
  if (stubs?.includes('dashboardWidget')) {
    return {
      'src/client/ExampleWidget.tsx': dedent`
        import * as React from 'react'
        import z from 'zod'
        import {
          DashboardWidgetProps,
          useDrop,
          useTagState,
        } from '@jcoreio/clarity-plugin-api/client'

        const ConfigSchema = z.object({
          tag: z.string().optional(),
        })
        type Config = z.output<typeof ConfigSchema>

        export default function ExampleWidget({
          config,
          setConfig,
        }: DashboardWidgetProps<Config>) {
          const parsed = ConfigSchema.safeParse(config)
          const tag = parsed.success ? parsed.data.tag : undefined

          const [, connectDropTarget] = useDrop({
            canDrop: ({ tag }) => tag != null,
            drop: ({ tag }) => {
              if (tag != null) setConfig({ tag })
              return undefined
            },
          })

          const tagState = useTagState(tag)

          return (
            <div
              data-component="ExampleWidget"
              data-tag={tag}
              ref={connectDropTarget}
            >
              {JSON.stringify(tagState)}
            </div>
          )
        }
      `,
    }
  }
}
