import { Request } from 'express'
import { APIContext } from './APIContext'

/**
 * @returns the {@link APIContext} associated with a given API {@link Request}
 * @throws if the {@link Request} is not a Clarity API request
 */
export function getAPIContext(request: Request): APIContext {
  const { apiContext } = request as any
  if (!apiContext) {
    throw new Error(`failed to get APIContext from request`)
  }
  return apiContext
}
