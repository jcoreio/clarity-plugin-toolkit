const required = 16

const parts = process.version.replace(/^v/, '').split('.')

if (parseInt(parts[0]) < required) {
  // eslint-disable-next-line no-console
  console.error(`@jcoreio/clarity-plugin-toolkit requires Node >= ${required}`)
  process.exit(1)
}
