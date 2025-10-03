import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function serverMigrate({ stubs }: TemplateOptions) {
  if (!stubs?.includes('jsMigrations') && !stubs?.includes('sqlMigrations')) {
    return {}
  }
  return {
    'src/server/migrate.ts': dedent`
      import { MigratePluginContributions } from '@jcoreio/clarity-plugin-api/server'
      import path from 'path'

      export default (() => ({
        migrations: { path: path.join(__dirname, 'migrations') },
      })) satisfies MigratePluginContributions
    `,
  }
}
