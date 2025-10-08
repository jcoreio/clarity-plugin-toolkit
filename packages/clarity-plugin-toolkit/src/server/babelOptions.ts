import { TransformOptions } from '@babel/core'

export function babelOptions(modules: false | 'commonjs'): TransformOptions {
  return {
    babelrc: false,
    sourceMaps: true,
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: { node: 20 },
          modules,
          exclude: ['proposal-dynamic-import'],
        },
      ],
      [require.resolve('@babel/preset-typescript')],
    ],
  }
}
