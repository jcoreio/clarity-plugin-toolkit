import type { TransformOptions } from '@babel/core'
import { requireResolve } from '../util/requireResolve.cjs'

export function babelOptions(modules: false | 'commonjs'): TransformOptions {
  return {
    babelrc: false,
    sourceMaps: true,
    presets: [
      [
        requireResolve('@babel/preset-env'),
        {
          targets: { node: 20 },
          modules,
          exclude: ['proposal-dynamic-import'],
        },
      ],
      [requireResolve('@babel/preset-typescript')],
    ],
  }
}
