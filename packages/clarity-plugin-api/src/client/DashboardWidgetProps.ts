/**
 * The props Clarity passes to a dashboard widget component provided by a plugin.
 */
export type DashboardWidgetProps<Config = any> = {
  /**
   * The config for this widget, which may take any form the plugin wants
   * as long as it's JSON serializable.
   *
   * When a widget is first created, the `config` will be `undefined`.
   */
  config: Config | undefined
  /**
   * Callback to set the config for this widget.  The plugin may set the config
   * to any value it wants as long as it's JSON serializable.
   */
  setConfig: (config: Config) => void
  /**
   * The number of prefix levels this widget should hide from any tags it displays,
   * as configured by the user for the dashboard it belongs to.  For example if displaying
   * the tag `Sites/Landfill/Flare/Temp`, and `hideTagPrefixLevels` is 2, the widget
   * should display `Flare/Temp`.
   */
  hideTagPrefixLevels: number
  /**
   * Whether the dashboard is currently in edit mode
   */
  editMode: boolean
  /**
   * Whether Clarity is currently saving the dashboard config
   */
  saving: boolean
}
