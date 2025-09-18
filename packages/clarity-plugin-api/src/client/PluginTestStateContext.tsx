import * as React from 'react'
import {
  PluginTestAction,
  PluginTestState,
  pluginTestReducer,
  initPluginTestState,
} from './PluginTestState'

export type PluginTestStateContextValue = {
  state: PluginTestState
  dispatch: (action: PluginTestAction) => void
}

const PluginTestStateContext = React.createContext<PluginTestStateContextValue>(
  {
    state: initPluginTestState(),
    dispatch: () => {
      throw new Error(
        'You must wrap your component in a <PluginTestStateProvider>'
      )
    },
  }
)

export function PluginTestStateProvider({
  initState,
  children,
}: {
  initState?: PluginTestState
  children: React.ReactNode
}) {
  const [state, dispatch] = React.useReducer(
    pluginTestReducer,
    initState || initPluginTestState()
  )
  const contextValue = React.useMemo(
    () => ({ state, dispatch }),
    [state, dispatch]
  )
  return (
    <PluginTestStateContext.Provider value={contextValue}>
      {children}
    </PluginTestStateContext.Provider>
  )
}

export function usePluginTestState(): PluginTestStateContextValue {
  return React.useContext(PluginTestStateContext)
}
