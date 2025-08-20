import React from 'react'
import { TagState } from './TagState'
import { useFeatureTestState } from './FeatureTestStateContext'

/**
 * React hook to subscribe to the state of a Clarity tag
 * @param {string | null} tag - the tag to subscribe to.  While nullish, no subscription will
 * active and `useTagState` will return `{ loading: false }`.
 * @returns an object with the current `loading`, `error`, and `data` status of the subscription
 */
export function useTagState(tag?: string | null): {
  loading: boolean
  error?: Error
  data?: TagState
} {
  const { state } = useFeatureTestState()
  return React.useMemo(() => {
    return tag ?
        state.tagStates[tag] || {
          loading: false,
          error: new Error(`tag not found: ${tag}`),
        }
      : { loading: false, data: undefined }
  }, [state.tagStates, tag])
}
