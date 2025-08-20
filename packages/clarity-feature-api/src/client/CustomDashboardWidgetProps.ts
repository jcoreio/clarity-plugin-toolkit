/**
 * The props Clarity passes to a custom dashboard widget component provided by a
 * custom feature.
 */
export type CustomDashboardWidgetProps<Config = any> = {
  /**
   * The config for this widget, which may take any form the custom feature wants
   * as long as it's JSON serializable.
   */
  config: Config
  /**
   * Callback to set the config for this widget.  The custom feature may set the config
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
