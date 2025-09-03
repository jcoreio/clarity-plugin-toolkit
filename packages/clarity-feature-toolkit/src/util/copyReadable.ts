import { Readable, PassThrough } from 'stream'

export function copyReadable(readable: Readable): PassThrough {
  const copy = new PassThrough()
  readable.on('data', (chunk) => copy.write(chunk))
  readable.on('error', (error) => copy.emit('error', error))
  readable.on('end', () => copy.end())
  return copy
}
