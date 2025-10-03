import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function serverMigrate({ stubs }: TemplateOptions) {
  if (!stubs?.includes('jsMigrations') && !stubs?.includes('sqlMigrations')) {
    return {}
  }
  return {
    'src/server/migrate.ts': dedent`
      import { MigratePluginContributions } from '@jcoreio/clarity-plugin-api/server'
      import { fileURLToPath } from 'url'

      export default (() => ({
        migrations: {
          path: fileURLToPath(new URL('./migrations', import.meta.url)),
        },
      })) satisfies MigratePluginContributions
    `,
  }
}
