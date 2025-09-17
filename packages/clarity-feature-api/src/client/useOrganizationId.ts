/**
 * Gets the id of the current organization the user is viewing from the URL path.
 * If the user isn't in an organization route, throws an error, unless you pass
 * `{ optional: true }`, in which case returns `undefined`.
 */
export function useOrganizationId(options: {
  optional: true
}): number | undefined
export function useOrganizationId(options?: { optional?: boolean }): number
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useOrganizationId(options?: {
  optional?: boolean
}): number | undefined {
  throw new Error(
    'this is a stub for the implementation that will be provided by Clarity'
  )
}
