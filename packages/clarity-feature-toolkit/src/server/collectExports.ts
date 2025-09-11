import { ExportsObject } from '@jcoreio/clarity-feature-api'

export function collectExports(
  exports?: string | ExportsObject,
  subpaths?: Set<string>,
  result: Set<string> = new Set()
) {
  if (typeof exports === 'string') {
    if (!subpaths || subpaths.has('.')) {
      if (/\.[cm]?[jt]sx?$/.test(exports) && !/\.d\.[cm]?ts$/.test(exports)) {
        result.add(exports)
      }
    }
  } else if (exports) {
    for (const key of Object.keys(exports)) {
      const value = exports[key]
      if (key.startsWith('.') && subpaths) {
        if (key.includes('*')) {
          const [before, after] = key.split('*', 2)
          let matched = false
          for (const subpath of subpaths) {
            if (subpath.startsWith(before) && subpath.endsWith(after)) {
              matched = true
              break
            }
          }
          if (!matched) continue
        }
        if (!subpaths.has(key)) {
          continue
        }
      }
      collectExports(value, key.startsWith('.') ? undefined : subpaths, result)
    }
  }
  return result
}
