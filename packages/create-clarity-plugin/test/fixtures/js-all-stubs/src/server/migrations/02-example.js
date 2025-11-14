export async function up(appContext) {
  await appContext.postgresPool.query(`
    CREATE TABLE "testpkg".example (
      key text NOT NULL PRIMARY KEY,
      value jsonb
    );
  `);
}
export async function down(appContext) {
  await appContext.postgresPool.query(`
    DROP TABLE "testpkg".example;
  `);
}
