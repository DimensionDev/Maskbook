import { produce } from 'immer'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EMPTY_LIST } from '@masknet/shared-base'
import { uniqBy } from 'lodash-es'

export interface AssetsState {
    loading: boolean
    finished: boolean
    assets: Web3Helper.NonFungibleAssetScope[]
}

export interface AssetsReducerState {
    assetsMap: Record<string, AssetsState>
    verifiedMap: Record<string, string[]>
}

type Action =
    | {
          type: 'SET_LOADING_STATUS'
          id: string
          loading?: boolean
          finished?: boolean
      }
    | {
          type: 'APPEND_ASSETS'
          id: string
          assets: Web3Helper.NonFungibleAssetScope[]
      }
    | {
          type: 'SET_VERIFIED'
          id: string
          verifiedBy: string[]
      }

export function createAssetsState() {
    return {
        assets: EMPTY_LIST,
        loading: false,
        finished: false,
    }
}

export const initialAssetsState: AssetsReducerState = { assetsMap: {}, verifiedMap: {} }

export function assetsReducer(state: AssetsReducerState, action: Action): AssetsReducerState {
    switch (action.type) {
        case 'SET_LOADING_STATUS':
            return produce(state, (draft) => {
                const { id, loading, finished } = action
                if (!draft.assetsMap[id]) draft.assetsMap[id] = createAssetsState()
                if (typeof loading !== 'undefined') {
                    draft.assetsMap[id].loading = loading
                }
                if (typeof finished !== 'undefined') {
                    draft.assetsMap[id].finished = finished
                }
            })
        case 'APPEND_ASSETS':
            return produce(state, (draft) => {
                const { id, assets } = action
                if (!draft.assetsMap[id]) draft.assetsMap[id] = createAssetsState()
                draft.assetsMap[id].assets = assets.length
                    ? uniqBy([...draft.assetsMap[id].assets, ...assets], (x) => `${x.id}.${x.tokenId}`)
                    : draft.assetsMap[id].assets ?? EMPTY_LIST
            })
        case 'SET_VERIFIED':
            return produce(state, (draft) => {
                const { id, verifiedBy } = action
                draft.verifiedMap[id] = verifiedBy
            })
    }
}
