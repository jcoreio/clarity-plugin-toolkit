import type { Readable } from 'stream'

export function isReadable(x: any): x is Readable {
  return x != null && typeof x === 'object' && typeof x.pipe === 'function'
}
