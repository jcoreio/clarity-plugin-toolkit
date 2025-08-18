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

export type FeatureTestAction = SetTagStateAction

export type FeatureTestState = {
  tagStates: { [K in string]?: LoadableTagState }
}

export function initFeatureTestState() {
  return { tagStates: {} }
}

export function featureTestReducer(
  state: FeatureTestState = initFeatureTestState(),
  action: FeatureTestAction
): FeatureTestState {
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
