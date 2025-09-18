import { TagState } from './TagState'

export type LoadableTagState = {
  loading: boolean
  error?: Error
  data?: TagState
}

export type SetTagStateAction = {
  type: 'SetTagState'
  tag: string
  state: LoadableTagState
}

export type PluginTestAction = SetTagStateAction

export type PluginTestState = {
  tagStates: { [K in string]?: LoadableTagState }
}

export function initPluginTestState() {
  return { tagStates: {} }
}

export function pluginTestReducer(
  state: PluginTestState = initPluginTestState(),
  action: PluginTestAction
): PluginTestState {
  switch (action.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case 'SetTagState':
      return {
        ...state,
        tagStates: {
          ...state.tagStates,
          [action.tag]: action.state,
        },
      }
  }
  return state
}
