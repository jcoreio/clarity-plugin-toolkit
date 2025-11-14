import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function serverMigrationsExampleTs({ name, stubs }: TemplateOptions) {
  if (!stubs?.includes('jsMigrations')) {
    return {}
  }
  return {
    'src/server/migrations/01-example.ts':
      stubs.includes('sqlMigrations') ? undefined : (
        dedent`
      import { AppContext } from '@jcoreio/clarity-plugin-api/server'

      export async function up(appContext: AppContext) {
        await appContext.postgresPool.query(\`
          CREATE SCHEMA "${name}";
        \`)
      }

      export async function down(appContext: AppContext) {
        await appContext.postgresPool.query(\`
          DROP SCHEMA "${name}" CASCADE;
        \`)
      }
    `
      ),
    'src/server/migrations/02-example.ts': dedent`
      import { AppContext } from '@jcoreio/clarity-plugin-api/server'

      export async function up(appContext: AppContext) {
        await appContext.postgresPool.query(\`
          CREATE TABLE "${name}".example (
            key text NOT NULL PRIMARY KEY,
            value jsonb
          );
        \`)
      }

      export async function down(appContext: AppContext) {
        await appContext.postgresPool.query(\`
          DROP TABLE "${name}".example;
        \`)
      }
    `,
  }
}
