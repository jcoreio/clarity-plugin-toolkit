import { AppContext } from './AppContext'

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
