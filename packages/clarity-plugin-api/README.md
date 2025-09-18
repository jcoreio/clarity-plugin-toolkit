# `@jcoreio/clarity-plugin-api`

This package provides a mock environment for developing plugins for Clarity.

## Client API

### `useTagState(tag: string)`

```ts
import { useTagState } from '@jcoreio/clarity-plugin-api/client'
```

React hook that subscribes to the realtime value, metadata, and alarm state of a tag.

#### Example

```tsx
import * as React from 'react'
import {
  useTagState,
  DashboardWidgetProps,
} from '@jcoreio/clarity-plugin-api/client'

export function MyWidget({
  config,
}: DashboardWidgetProps<{ tag: string } | undefined>) {
  const { loading, error, data } = useTagState(config?.tag)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const t = data?.t
  const v = data?.v
  const metadata = data?.metadata
  const notification = data?.notification
  const name = metadata?.fullName?.join('/') || tag
  return <div>
    Most recent data for {name}:
    <p>Time: {t != null ? new Date(t).toLocaleString()}</p>
    <p>Value: {v}</p>
    <p>Notification: {notification?.severity}</p>
  </div>
}
```

### `useDrop(spec)`

```ts
import { useDrop } from '@jcoreio/clarity-plugin-api/client'
```

React hook for connecting a drop target to Clarity

#### Example

```tsx
import * as React from 'react'
import {
  useTagState,
  DashboardWidgetProps,
} from '@jcoreio/clarity-plugin-api/client'

export function MyWidget({
  config,
  setConfig,
}: DashboardWidgetProps<{ tag?: string } | undefined>) {
  const [{ isOver, canDrop, tag, MetadataItem }, connectDropTarget] = useDrop(
    {
      canDrop: ({ tag, MetadataItem }) => tag != null,
      drop: ({ tag, MetadataItem }): undefined => {
        if (tag != null) setConfig({ tag })
      },
    },
    [setConfig]
  )

  return (
    <div ref={connectDropTarget}>
      {tag != null ?
        <p>Drop to set tag to {tag}</p>
      : <p>Tag: {config?.tag}</p>}
    </div>
  )
}
```
