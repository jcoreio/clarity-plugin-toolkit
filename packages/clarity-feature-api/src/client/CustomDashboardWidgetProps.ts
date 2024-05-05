export type CustomDashboardWidgetProps<Config = any> = {
  config: Config
  setConfig: (config: Config) => void
  hideTagPrefixLevels: number
  editMode: boolean
  saving: boolean
}
