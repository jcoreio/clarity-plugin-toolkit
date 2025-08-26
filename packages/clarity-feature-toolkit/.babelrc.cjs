/* eslint-env node, es2018 */
module.exports = function (api) {
  const base = require('@jcoreio/toolchain-esnext/.babelrc.cjs')(api)
  return {
    ...base,
    presets: base.presets.map((p) =>
      Array.isArray(p) && p[0].endsWith('@babel/preset-env/lib/index.js') ?
        [
          p[0],
          {
            ...p[1],
            exclude: [...(p[1].exclude || []), 'proposal-dynamic-import'],
          },
        ]
      : p
    ),
  }
}
