import React from 'react'
import { TagState } from './TagState'
import { useFeatureTestState } from './FeatureTestStateContext'

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
