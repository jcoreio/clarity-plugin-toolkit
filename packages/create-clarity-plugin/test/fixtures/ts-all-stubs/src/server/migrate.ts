import { MigratePluginContributions } from "@jcoreio/clarity-plugin-api/server";
import { fileURLToPath } from "url";

export default (() => ({
  migrations: {
    path: fileURLToPath(new URL("./migrations", import.meta.url)),
  },
})) satisfies MigratePluginContributions;
