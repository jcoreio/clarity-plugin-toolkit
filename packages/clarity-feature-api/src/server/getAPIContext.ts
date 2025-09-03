import { Request } from 'express'
import { APIContext } from './APIContext'

export function getAPIContext(request: Request): APIContext {
  const { apiContext } = request as any
  if (!apiContext) {
    throw new Error(`failed to get APIContext from request`)
  }
  return apiContext
}
