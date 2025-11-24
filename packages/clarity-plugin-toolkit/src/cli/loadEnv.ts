import dotenv from 'dotenv'
import chalk from 'chalk'

const envValues: typeof process.env = {}
dotenv.config({
  quiet: true,
  // @ts-expect-error dotenv types are in the wrong here
  processEnv: envValues,
})

let warnedAboutInterpolation = false
for (const key in envValues) {
  if (key.startsWith('CLARITY_PLUGIN_TOOLKIT_')) {
    const value = envValues[key]
    if (value == null) continue
    if (value.includes('$')) {
      if (!warnedAboutInterpolation) {
        // eslint-disable-next-line no-console
        console.error(
          chalk.yellow(
            `Warning: clarity-plugin-toolkit doesn't support interpolation in .env yet (found ${key}=${value})`
          )
        )
        warnedAboutInterpolation = true
      }
      continue
    }
    process.env[key] = value
  }
}
