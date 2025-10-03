export type Stub =
  | 'dashboardWidget'
  | 'organizationView'
  | 'expressApi'
  | 'sidebarItem'
  | 'sqlMigrations'
  | 'jsMigrations'

export type TemplateOptions = {
  name?: string
  useToolchain?: boolean
  toolchainVersion: string
  useTypescript?: boolean
  useEslint?: boolean
  usePrettier?: boolean
  clarityPluginToolkitDir: string
  stubs?: Stub[]
  packageManager?: string
}
