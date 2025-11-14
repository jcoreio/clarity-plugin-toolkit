# `@jcoreio/clarity-plugin-api`

This package provides a mock environment for developing plugins for Clarity.
Many of the exports from this package are nonfunctional stubs; Clarity injects a runtime
implementation of this package with the same API as provided here.

# Table of Contents

- [`@jcoreio/clarity-plugin-api`](#jcoreioclarity-plugin-api)
- [Table of Contents](#table-of-contents)
- [Client API](#client-api)
  - [type `DashboardWidgetProps`](#type-dashboardwidgetprops)
  - [type `ClientPluginContributions`](#type-clientplugincontributions)
  - [Tag State](#tag-state)
    - [`useTagState(tag: string): { loading: boolean, error?: Error, data?: TagState }`](#usetagstatetag-string--loading-boolean-error-error-data-tagstate-)
      - [Example](#example)
    - [type `TagState`](#type-tagstate)
  - [Drag and Drop](#drag-and-drop)
    - [`useDrop(spec, deps?)`](#usedropspec-deps)
      - [Arguments](#arguments)
        - [`spec: FactoryOrInstance<ClarityDropTargetHookSpec>`](#spec-factoryorinstanceclaritydroptargethookspec)
        - [`deps?: unknown[]`](#deps-unknown)
      - [Returns `[ClarityCollectedProps, ConnectDropTarget]`](#returns-claritycollectedprops-connectdroptarget)
      - [Example](#example-1)
  - [Routing Hooks](#routing-hooks)
    - [`useCurrentPluginRoute(): PluginRouteInfo`](#usecurrentpluginroute-pluginrouteinfo)
    - [`useOrganizationId(options): number | undefined`](#useorganizationidoptions-number--undefined)
  - [Styling](#styling)
    - [`useSeverityPulseStyles(options)`](#useseveritypulsestylesoptions)
      - [`options.property`](#optionsproperty)
      - [`options.variant`](#optionsvariant)
      - [Returns](#returns)
  - [Sidebar Components](#sidebar-components)
    - [`SidebarItem`](#sidebaritem)
    - [`SidebarItemText`](#sidebaritemtext)
    - [`SidebarItemIcon`](#sidebaritemicon)
    - [`SidebarItemSecondaryAction`](#sidebaritemsecondaryaction)
    - [`SidebarSection`](#sidebarsection)
    - [`SidebarSectionHeader`](#sidebarsectionheader)
- [Server API](#server-api)
  - [type `WebappPluginContributions`](#type-webappplugincontributions)
  - [type `MigratePluginContributions`](#type-migrateplugincontributions)
  - [`getAPIContext(request: Request): APIContext`](#getapicontextrequest-request-apicontext)
  - [type `APIContext`](#type-apicontext)
    - [Properties](#properties)
      - [`appContext: AppContext`](#appcontext-appcontext)
      - [`actorId: number | null | undefined`](#actorid-number--null--undefined)
      - [`actorIp: string | null | undefined`](#actorip-string--null--undefined)
  - [type `AppContext`](#type-appcontext)
    - [Properties](#properties-1)
      - [`postgresPool`](#postgrespool)
- [Shared API](#shared-api)
  - [Plugin Route Paths](#plugin-route-paths)
    - [`PluginRouteStub<Params extends {}>`](#pluginroutestubparams-extends-)
      - [`parse(pathname: string): Params`](#parsepathname-string-params)
      - [`format(params: Params): string`](#formatparams-params-string)
      - [`partialFormat(params: Partial<Params>): string`](#partialformatparams-partialparams-string)
    - [`apiBasePath: PluginRouteStub<{ plugin: string }>`](#apibasepath-pluginroutestub-plugin-string-)
    - [`uiBasePath: PluginRouteStub<{ plugin: string }>`](#uibasepath-pluginroutestub-plugin-string-)
    - [`organizationUIBasePath: PluginRouteStub<{ plugin: string }>`](#organizationuibasepath-pluginroutestub-plugin-string-)

# Client API

## type `DashboardWidgetProps`

```ts
import { DashboardWidgetProps } from '@jcoreio/clarity-plugin-api/client'
```

The props Clarity passes to a dashboard widget component provided by a plugin.

See [DashboardWidgetProps.ts](src/client/DashboardWidgetProps.ts)

## type `ClientPluginContributions`

```ts
import { ClientPluginContributions } from '@jcoreio/clarity-plugin-api/client'
```

Components and behaviors contributed to the client side of Clarity by a plugin.
You should make sure the default export from your client entrypoint satisfies this type.

See [ClientPluginContributions.ts](src/client/ClientPluginContributions.ts)

## Tag State

### `useTagState(tag: string): { loading: boolean, error?: Error, data?: TagState }`

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

### type `TagState`

```ts
import { TagState } from '@jcoreio/clarity-plugin-api/client'
```

See [`TagState.ts`](src/client/TagState.ts)

## Drag and Drop

### `useDrop(spec, deps?)`

```ts
import { useDrop } from '@jcoreio/clarity-plugin-api/client'
```

React hook for connecting a drop target to Clarity

#### Arguments

See types in [dnd.ts](src/client/dnd.ts)

##### `spec: FactoryOrInstance<ClarityDropTargetHookSpec>`

The drop target specification (object or function, function preferred)

##### `deps?: unknown[]`

The memoization deps array to use when evaluating spec changes

#### Returns `[ClarityCollectedProps, ConnectDropTarget]`

See types in [dnd.ts](src/client/dnd.ts)

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

## Routing Hooks

### `useCurrentPluginRoute(): PluginRouteInfo`

```ts
import { useCurrentPluginRoute } from '@jcoreio/clarity-plugin-api/client'
```

Returns information about the plugin route associated with the current `location.pathname`.
Throws if `location.pathname` is not a plugin route or subroute

See [useCurrentPluginRoute.ts](src/client/useCurrentPluginRoute.ts) for properties of
the `PluginRouteInfo` return type.

### `useOrganizationId(options): number | undefined`

```ts
import { useOrganizationId } from '@jcoreio/clarity-plugin-api/client'
```

Returns the id of the current organization the user is viewing from the URL path.
Returns `undefined` if the user isn't in an organization route and `options?.optional`
is truthy
Throws if the user isn't in an organization route and `options?.optional` is falsy

## Styling

### `useSeverityPulseStyles(options)`

```ts
import { useSeverityPulseStyles } from '@jcoreio/clarity-plugin-api/client'
```

Creates CSS classes to apply a color pulse animation for a warning, alarm, or critical condition
to the given CSS property.

#### `options.property`

The camel-cased CSS property to animate (e.g. `backgroundColor`)

#### `options.variant`

Which set of colors to use:

- 'pale' - light, less saturated colors (used for gauge backgrounds)
- 'bright' - fully saturated colors

#### Returns

An object with `info`, `warning`, `alarm`, and `critical` properties, which are
CSS class names. The `info` class doesn't apply an animation, but is provided for convenience
since `info` is one of the severity enum constants.

## Sidebar Components

You can use these in a component provided by your plugin in the `sidebarSections` property of your
[`ClientPluginContributions](#type-clientplugincontributions).

### `SidebarItem`

```ts
import { SidebarItem } from '@jcoreio/clarity-plugin-api/client'
```

The React component for a single item in the sidebar.

See [SidebarItem.tsx](src/client/Sidebar/SidebarItem.tsx) for properties.

### `SidebarItemText`

```ts
import { SidebarItemText } from '@jcoreio/clarity-plugin-api/client'
```

The React component for text inside a [`<SidebarItem>`](#sidebaritem)

See [SidebarItemText.tsx](src/client/Sidebar/SidebarItemText.tsx) for properties.

### `SidebarItemIcon`

```ts
import { SidebarItemIcon } from '@jcoreio/clarity-plugin-api/client'
```

The React component for an icon inside a [`<SidebarItem>`](#sidebaritem)

See [SidebarItemIcon.tsx](src/client/Sidebar/SidebarItemIcon.tsx) for properties.

### `SidebarItemSecondaryAction`

```ts
import { SidebarItemSecondaryAction } from '@jcoreio/clarity-plugin-api/client'
```

The React component for a secondary action (icon button, loading spinner, etc) inside a
[`<SidebarItem>`](#sidebaritem) on the right hand side.

See [SidebarItemSecondaryAction.tsx](src/client/Sidebar/SidebarItemSecondaryAction.tsx) for properties.

### `SidebarSection`

```ts
import { SidebarSection } from '@jcoreio/clarity-plugin-api/client'
```

The React component for a sidebar section, which comprises a header item
(rendered via [`<SidebarSectionHeader>`](#sidebarsectionheader)) and a collapsible list of
children, which may be [`<SidebarItem>`](#sidebaritem)s or other elements.

See [SidebarSection.tsx](src/client/Sidebar/SidebarSection.tsx) for properties.

### `SidebarSectionHeader`

```ts
import { SidebarSectionHeader } from '@jcoreio/clarity-plugin-api/client'
```

The React component for the header of a [`<SidebarSection>`](#sidebarsection), renders a
[`<SidebarItem>`](#sidebaritem).

See [SidebarSectionHeader.tsx](src/client/Sidebar/SidebarSectionHeader.tsx) for properties.

# Server API

## type `WebappPluginContributions`

```ts
import { WebappPluginContributions } from '@jcoreio/clarity-plugin-api/server'
```

Components and behaviors contributed to the server side webapp task of Clarity by a plugin,
like API methods.

See [WebappPluginContributions.ts](src/server/WebappPluginContributions.ts) for properties.

## type `MigratePluginContributions`

```ts
import { MigratePluginContributions } from '@jcoreio/clarity-plugin-api/server'
```

Behaviors contributed to the server side migrate task of Clarity by a plugin, like database migrations.

See [MigratePluginContributions.ts](src/server/MigratePluginContributions.ts) for properties.

## `getAPIContext(request: Request): APIContext`

```ts
import { getAPIContext } from '@jcoreio/clarity-plugin-api/server'
```

## type `APIContext`

```ts
import type { APIContext } from '@jcoreio/clarity-plugin-api/server'
```

The context of a Clarity API request
Use `getAPIContext` to get the `APIContext` from an express `Request`

See [APIContext.ts](src/server/APIContext.ts) for more info.

### Properties

#### `appContext: AppContext`

The Clarity [`AppContext`](#appcontext)

#### `actorId: number | null | undefined`

The id of the Clarity user who is performing the request, if any

#### `actorIp: string | null | undefined`

The IP address of the user who is performing the request, if available

## type `AppContext`

```ts
import type { AppContext } from '@jcoreio/clarity-plugin-api/server'
```

The Clarity application context types exposed to plugins.
In an API method handler, you can get the `AppContext` via [`getAPIContext(request)`](#getapicontextrequest-request-apicontext)`.appContext`

See [AppContext.ts](src/server/AppContext.ts) for more info.

### Properties

#### `postgresPool`

The postgres pool of connections to the app database.
This may not be a true {@link Pool pg.Pool} instance, instead it may
be an adapter that provides the `Pool.connect`, `Pool.query`,
and `PoolClient.release()` with the same signatures in `pg`.

# Shared API

## Plugin Route Paths

Provides URL route parsers and formatters for plugins.
The specific URL formats are determined by Clarity, so you should use these helpers
instead of hardcoding any base paths in your plugin.

See [pluginRoutePaths.ts](src/pluginRoutePaths.ts)

### `PluginRouteStub<Params extends {}>`

The interface for parsing/formatting URL routes

#### `parse(pathname: string): Params`

Parses the given URL `pathname` and returns the parsed `Params` for this route.
Throws if `pathname` doesn't match this route

#### `format(params: Params): string`

Creates a URL `pathname` for the given params.

#### `partialFormat(params: Partial<Params>): string`

Creates a URL `pathname` pattern for the given params. If a value for a parameter like
`plugin` is omitted, that part of the pattern will be left as `:plugin` instead of being
replaced by the parameter value.

### `apiBasePath: PluginRouteStub<{ plugin: string }>`

```ts
import { apiBasePath } from '@jcoreio/clarity-plugin-api/client'
// or
import { apiBasePath } from '@jcoreio/clarity-plugin-api/server'
```

The base path for plugins' API routes

### `uiBasePath: PluginRouteStub<{ plugin: string }>`

```ts
import { uiBasePath } from '@jcoreio/clarity-plugin-api/client'
// or
import { uiBasePath } from '@jcoreio/clarity-plugin-api/server'
```

The base path for plugins' UI routes that aren't under the base path for an organization

### `organizationUIBasePath: PluginRouteStub<{ plugin: string }>`

```ts
import { organizationUIBasePath } from '@jcoreio/clarity-plugin-api/client'
// or
import { organizationUIBasePath } from '@jcoreio/clarity-plugin-api/server'
```

The base path for plugins' UI routes under the base path for an organization
