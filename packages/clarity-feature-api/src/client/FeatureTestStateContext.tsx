import * as React from 'react'
import {
  FeatureTestAction,
  FeatureTestState,
  featureTestReducer,
  initFeatureTestState,
} from './FeatureTestState'

export type FeatureTestStateContextValue = {
  state: FeatureTestState
  dispatch: (action: FeatureTestAction) => void
}

const FeatureTestStateContext =
  React.createContext<FeatureTestStateContextValue>({
    state: initFeatureTestState(),
    dispatch: () => {
      throw new Error(
        'You must wrap your component in a <FeatureTestStateProvider>'
      )
    },
  })

export function FeatureTestStateProvider({
  initState,
  children,
}: {
  initState?: FeatureTestState
  children: React.ReactNode
}) {
  const [state, dispatch] = React.useReducer(
    featureTestReducer,
    initState || initFeatureTestState()
  )
  const contextValue = React.useMemo(
    () => ({ state, dispatch }),
    [state, dispatch]
  )
  return (
    <FeatureTestStateContext.Provider value={contextValue}>
      {children}
    </FeatureTestStateContext.Provider>
  )
}

export function useFeatureTestState(): FeatureTestStateContextValue {
  return React.useContext(FeatureTestStateContext)
}
