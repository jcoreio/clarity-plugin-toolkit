import { AppContext } from "@jcoreio/clarity-plugin-api/server";

export async function up(appContext: AppContext) {
  await appContext.postgresPool.query(`
    CREATE TABLE "testpkg".example (
      key text NOT NULL PRIMARY KEY,
      value jsonb
    );
  `);
}

export async function down(appContext: AppContext) {
  await appContext.postgresPool.query(`
    DROP TABLE "testpkg".example;
  `);
}
