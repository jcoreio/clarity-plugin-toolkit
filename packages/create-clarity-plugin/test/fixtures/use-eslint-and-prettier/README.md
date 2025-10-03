This is a [Clarity](https://www.jcore.io/clarity) plugin project bootstrapped with [`create-clarity-plugin`](https://github.com/jcoreio/clarity-plugin-toolkit/tree/master/packages/create-clarity-plugin).

## Creating a Dashboard widget

In `src/client/index.js`:

```js
export default {
  dashboardWidgets: {
    MyWidget: {
      displayName: "MyWidget",
      component: () => import("./MyWidget"),
    },
  },
};
```

Then create the widget file:

```js
import * as React from "react";
import {
  useTagState,
  useDrop,
  DashboardWidgetProps,
} from "@jcoreio/clarity-plugin-api/client";

export default function MyWidget({ config, setConfig }) {
  const tag = config?.tag;
  const tagState = useTagState(tag);
  const [, connectDropTarget] = useDrop({
    canDrop: ({ tag }) => tag != null,
    drop: ({ tag }) => {
      if (tag) setConfig({ tag });
      return undefined;
    },
  });
  return (
    <div ref={connectDropTarget}>
      <h1>My Widget</h1>
      <pre>{JSON.stringify(config, null, 2)}</pre>
      <pre>{JSON.stringify(tagState, null, 2)}</pre>
    </div>
  );
}
```

## Deploying

Run `npm run deploy`, and `clarity-plugin-toolkit` will run through the process of deploying to
Clarity in an interactive CLI.
