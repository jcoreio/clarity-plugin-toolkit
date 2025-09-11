import { ExportsObject } from '@jcoreio/clarity-feature-api'
import { mapValues } from 'lodash'

export function mapExports(
  exports: string | ExportsObject | undefined,
  mapper: (file: string) => string
): string | ExportsObject | undefined {
  if (typeof exports === 'string') return mapper(exports)
  if (exports) return mapValues(exports, (value) => mapExports(value, mapper))
  return undefined
}
