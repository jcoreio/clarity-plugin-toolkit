import { AppContext } from './AppContext'

/**
 * The context of a Clarity API request
 * Use `getAPIContext` to get the `APIContext` from an express `Request`
 */
export interface APIContext {
  readonly appContext: AppContext
  readonly actorId: number | null | undefined
  readonly actorIp: string | null | undefined
  // hasAPIToken
  // verifyAPIToken
  // organizationId
  // requireOrganizationId
  // requireActorId
  // query?
  // withTransaction?
}
