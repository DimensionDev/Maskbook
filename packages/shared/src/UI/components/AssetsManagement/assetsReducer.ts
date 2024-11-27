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

type AssetsAction =
    | {
          type: 'SET_LOADING_STATUS'
          id: string
          account: string
          loading?: boolean
          finished?: boolean
      }
    | {
          type: 'APPEND_ASSETS'
          id: string
          account: string
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

/**
 * To distinguish assets among multiple accounts, we combine account and collection id as store-id.
 *
 */
export function assetsReducer(state: AssetsReducerState, action: AssetsAction): AssetsReducerState {
    switch (action.type) {
        case 'SET_LOADING_STATUS':
            return produce(state, (draft) => {
                const { loading, finished, id, account } = action
                const storeId = `${account}.${id}`
                if (!draft.assetsMap[storeId]) draft.assetsMap[storeId] = createAssetsState()
                if (typeof loading !== 'undefined') {
                    draft.assetsMap[storeId].loading = loading
                }
                if (typeof finished !== 'undefined') {
                    draft.assetsMap[storeId].finished = finished
                }
            })
        case 'APPEND_ASSETS':
            return produce(state, (draft) => {
                const { id, account, assets } = action
                const storeId = `${account}.${id}`
                if (!draft.assetsMap[storeId]) draft.assetsMap[storeId] = createAssetsState()
                draft.assetsMap[storeId].assets =
                    assets.length ?
                        uniqBy([...draft.assetsMap[storeId].assets, ...assets], (x) => `${x.id}.${x.tokenId}`)
                    :   (draft.assetsMap[storeId].assets ?? EMPTY_LIST)
            })
        case 'SET_VERIFIED':
            return produce(state, (draft) => {
                const { id, verifiedBy } = action
                draft.verifiedMap[id] = verifiedBy
            })
    }
}
