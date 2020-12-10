import { useReducer } from 'react'
import { isSameAddress } from '../../../web3/helpers'
import type { EtherTokenDetailed, ERC20TokenDetailed } from '../../../web3/types'

export interface PoolState {
    sellToken: EtherTokenDetailed | ERC20TokenDetailed
    buyTokens: (EtherTokenDetailed | ERC20TokenDetailed)[]
}

export enum PoolActionType {
    UPDATE_SELL_TOKEN,
    ADD_BUY_TOKEN,
    REMOVE_BUY_TOKEN,
    UPDATE_BUY_TOKEN,
}

export type PoolAction =
    | {
          type: PoolActionType.ADD_BUY_TOKEN
          token: EtherTokenDetailed | ERC20TokenDetailed
      }
    | {
          type: PoolActionType.UPDATE_SELL_TOKEN
          token?: PartialRequired<EtherTokenDetailed | ERC20TokenDetailed, 'address'>
      }
    | {
          type: PoolActionType.REMOVE_BUY_TOKEN
          token?: PartialRequired<EtherTokenDetailed | ERC20TokenDetailed, 'address'>
      }
    | {
          type: PoolActionType.UPDATE_BUY_TOKEN
          token?: PartialRequired<EtherTokenDetailed | ERC20TokenDetailed, 'address'>
      }

function reducer(state: PoolState, action: PoolAction): PoolState {
    switch (action.type) {
        case PoolActionType.ADD_BUY_TOKEN:
            return {
                ...state,
                sellToken: action.token,
            }
        case PoolActionType.UPDATE_SELL_TOKEN:
            return {
                ...state,
                buyTokens: [...state.buyTokens.filter((x) => !isSameAddress(x.address, action.token?.address))],
            }
    }
    return state
}

export function usePoolState(sellToken: EtherTokenDetailed | ERC20TokenDetailed) {
    return useReducer(reducer, {
        sellToken,
        buyTokens: [],
    })
}
