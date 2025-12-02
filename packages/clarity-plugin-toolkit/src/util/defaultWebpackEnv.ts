export const defaultWebpackEnv = process.env.CLARITY_PLUGIN_TOOLKIT_ENV?.split(
  /\s*,\s*/g
) || ['production']
