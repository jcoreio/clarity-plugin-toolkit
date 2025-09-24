export const isInteractive =
  !process.env.JCOREIO_TOOLCHAIN_SELF_TEST &&
  process.stdout.isTTY &&
  process.env.TERM !== 'dumb' &&
  !('CI' in process.env)
