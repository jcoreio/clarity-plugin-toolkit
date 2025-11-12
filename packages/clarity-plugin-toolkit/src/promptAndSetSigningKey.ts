import prompt from 'prompts'
import crypto from 'crypto'
import { parseSigningKey } from './getSigningKey.ts'
import setSigningKey from './setSigningKey.ts'

export default async function promptAndSetSigningKey(): Promise<{
  id: number
  privateKey: crypto.KeyObject
}> {
  const { key } = await prompt({
    name: 'key',
    type: 'invisible',
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
