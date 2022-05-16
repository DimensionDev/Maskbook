import { v4 as uuid } from 'uuid'
import { useReducer } from 'react'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export interface ExchangeTokenAndAmountState {
    key: string
    amount: string
    token?: FungibleToken<ChainId, SchemaType>
}

export enum ExchangeTokenAndAmountActionType {
    ADD = 0,
    REMOVE = 1,
    UPDATE_AMOUNT = 2,
    UPDATE_TOKEN = 3,
}

export type ExchangeTokenAndAmountAction =
    | {
          type: ExchangeTokenAndAmountActionType.ADD
          key: string
          amount: string
          token?: FungibleToken<ChainId, SchemaType>
      }
    | {
          type: ExchangeTokenAndAmountActionType.REMOVE
          key: string
      }
    | {
          type: ExchangeTokenAndAmountActionType.UPDATE_AMOUNT
          amount: string
          key: string
      }
    | {
          type: ExchangeTokenAndAmountActionType.UPDATE_TOKEN
          token?: FungibleToken<ChainId, SchemaType>
          key: string
      }

function reducer(
    state: ExchangeTokenAndAmountState[],
    action: ExchangeTokenAndAmountAction,
): ExchangeTokenAndAmountState[] {
    switch (action.type) {
        case ExchangeTokenAndAmountActionType.ADD:
            return [
                ...state,
                {
                    key: uuid(),
                    amount: '',
                    token: undefined,
                },
            ]
        case ExchangeTokenAndAmountActionType.REMOVE:
            return state.filter((item) => item.key !== action.key)
        case ExchangeTokenAndAmountActionType.UPDATE_AMOUNT:
            return state.map((item) => (item.key === action.key ? { ...item, amount: action.amount } : item))
        case ExchangeTokenAndAmountActionType.UPDATE_TOKEN:
            return state.map((item) => (item.key === action.key ? { ...item, token: action.token } : item))
        default:
            return state
    }
}

export function useExchangeTokenAndAmount(arrState?: ExchangeTokenAndAmountState[]) {
    return useReducer(
        reducer,
        arrState && arrState.length > 0
            ? arrState
            : [
                  {
                      key: uuid(),
                      amount: '',
                      token: undefined,
                  },
                  {
                      key: uuid(),
                      amount: '',
                      token: undefined,
                  },
              ],
    )
}
