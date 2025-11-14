import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function serverMigrationsExampleSql({ name, stubs }: TemplateOptions) {
  if (!stubs?.includes('sqlMigrations')) {
    return {}
  }
  return {
    'src/server/migrations/01-example.sql': dedent`
      CREATE SCHEMA "${name}";

      -- down

      DROP SCHEMA "${name}" CASCADE;
    `,
    'src/server/migrations/02-example.sql':
      stubs.includes('jsMigrations') ? undefined : (
        dedent`
          CREATE TABLE "${name}".example (
            key text NOT NULL PRIMARY KEY,
            value jsonb
          );

          -- down

          DROP TABLE "${name}".example;
        `
      ),
  }
}
