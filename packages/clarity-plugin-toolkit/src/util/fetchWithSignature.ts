import crypto from 'crypto'

/**
 * Performs an HTTP `fetch` with an authentication signature built from the
 * url `pathname`/`search` concatenated with a newline `\n` and the request
 * body.
 */
export async function fetchWithSignature(
  url: string | URL,
  init: RequestInit,
  signingKey: {
    id: number
    privateKey: crypto.KeyObject
  }
) {
  if (typeof url === 'string') url = new URL(url)
  const signer = crypto.createSign('SHA256')
  signer.write(url.pathname + url.search)
  if (init.body != null) {
    signer.write('\n')
    signer.end(init.body)
  }
  const signature = signer.sign(signingKey.privateKey).toString('base64')

  const headers = new Headers()
  if (init.headers instanceof Headers) {
    init.headers.forEach((value, name) => headers.append(name, value))
  } else if (Array.isArray(init.headers)) {
    for (const [name, value] of init.headers) headers.set(name, value)
  } else if (init.headers) {
    for (const name in init.headers) {
      const value = init.headers[name]
      if (Array.isArray(value)) {
        for (const elem of value) headers.append(name, elem)
      } else {
        // @ts-expect-error not sure how to exclude readonly string[]
        headers.set(name, value)
      }
    }
  }
  headers.set('X-Clarity-Signing-Key-Id', String(signingKey.id))
  headers.set('X-Clarity-Signature', signature)

  return fetch(url, {
    ...init,
    headers,
  })
}
