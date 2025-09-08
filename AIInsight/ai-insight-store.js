import { curry } from 'lodash';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// const networkIntents = ['dropped call']
const networkIntents = ["IN11512", "IN11517", "IN11931", "IN11932", "IN11331", "IN11553", "IN11836", "IN11352", "IN11842","IN11968"];

const deviceIntents = [
  'IN0120',
  'IN0119',
  'IN11476',
  'IN0121',
  'IN11399',
  'IN11710',
  'IN11659'
]

export const getIsNetworkInsight = (intentId) => networkIntents.includes(intentId)
export const getIsDeviceInsight = (intentId) => deviceIntents.includes(intentId)
export const getIsAIInsight = (intentId) => intentId  ==='dropped call' || getIsDeviceInsight(intentId)

const initialState = {
  intentId: 'dropped call',
  isNetworkInsight: true,
  currentIntent: {}
}

const store = (set) => ({
  store: initialState,
  setStore: (partialState) =>
    set(
      (state) => {
        const newState = {
          ...state.store,
          ...partialState,
        }
        return {
          store: {
            ...newState,
            isNetworkInsight: newState?.intentId  === 'dropped call',
            isDeviceInsight: getIsDeviceInsight(newState?.intentId),
            isAIInsight: getIsAIInsight(newState?.intentId),
          },
        }
      },
      false,
      `@update/${Object.keys(partialState).join(',')}`
    ),
  reset: () => set((state) => ({ ...state, store: initialState }), false, '@reset'),
  setCurrentIntent: (currentIntent) => set((state) => ({store: {...state.store, currentIntent}})),
})

export const useAIInsightStore = create(
  // @ts-expect-error - Ignoring this because of issue with build
  devtools(store, {
    name: 'ai-insight-store',
  })
)
