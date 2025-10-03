import { MigratePluginContributions } from "@jcoreio/clarity-plugin-api/server";
import path from "path";

export default (() => ({
  migrations: { path: path.join(__dirname, "migrations") },
})) satisfies MigratePluginContributions;
