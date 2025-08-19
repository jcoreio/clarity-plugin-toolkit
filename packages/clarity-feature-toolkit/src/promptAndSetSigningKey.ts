import prompt from 'prompts'
import crypto from 'crypto'
import { parseSigningKey } from './getSigningKey'
import setSigningKey from './setSigningKey'

export default async function promptAndSetSigningKey(): Promise<{
  id: number
  privateKey: crypto.KeyObject
}> {
  const { key } = await prompt({
    name: 'key',
    type: 'password',
    message: 'Paste signing key:',
    validate: (value: any) => {
      if (typeof value !== 'string') return 'is required'
      try {
        parseSigningKey(value)
      } catch {
        return 'invalid signing key'
      }
      return true
    },
  })
  return await setSigningKey(key)
}
