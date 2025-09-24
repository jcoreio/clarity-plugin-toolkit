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

export default function TestDashboardWidget({
  config,
  setConfig,
}: DashboardWidgetProps<Config>) {
  const parsed = ConfigSchema.safeParse(config)
  const tag = parsed.success ? parsed.data.tag : undefined

  const [, connectDropTarget] = useDrop({
    canDrop: ({ tag }) => tag !== null,
    drop: ({ tag }) => {
      if (tag != null) setConfig({ tag })
      return undefined
    },
  })

  const tagState = useTagState(tag)

  return (
    <div
      data-component="TestDashboardWidget"
      data-tag={tag}
      ref={connectDropTarget}
    >
      {JSON.stringify(tagState)}
    </div>
  )
}
