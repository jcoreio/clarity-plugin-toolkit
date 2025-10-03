import { makeWebpackConfig } from "@jcoreio/clarity-plugin-toolkit";

export default (
  env: { [name in string]?: string },
  argv: { [name in string]?: unknown },
) => makeWebpackConfig(env, argv);
