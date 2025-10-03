import * as React from "react";
import z from "zod";
import { useDrop, useTagState } from "@jcoreio/clarity-plugin-api/client";
const ConfigSchema = z.object({
  tag: z.string().optional(),
});
export default function ExampleWidget({ config, setConfig }) {
  const parsed = ConfigSchema.safeParse(config);
  const tag = parsed.success ? parsed.data.tag : undefined;
  const [, connectDropTarget] = useDrop({
    canDrop: ({ tag }) => tag != null,
    drop: ({ tag }) => {
      if (tag != null)
        setConfig({
          tag,
        });
      return undefined;
    },
  });
  const tagState = useTagState(tag);
  return (
    <div data-component="ExampleWidget" data-tag={tag} ref={connectDropTarget}>
      {JSON.stringify(tagState)}
    </div>
  );
}
