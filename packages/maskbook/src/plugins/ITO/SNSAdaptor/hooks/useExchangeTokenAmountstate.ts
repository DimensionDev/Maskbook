import { v4 as uuid } from 'uuid'
import { useReducer } from 'react'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'

export interface ExchangeTokenAndAmountState {
    key: string
    amount: string
    token?: FungibleTokenDetailed
}

export enum ExchangeTokenAndAmountActionType {
    ADD,
    REMOVE,
    UPDATE_AMOUNT,
    UPDATE_TOKEN,
}

export type ExchangeTokenAndAmountAction =
    | {
          type: ExchangeTokenAndAmountActionType.ADD
          key: string
          amount: string
          token?: FungibleTokenDetailed
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
          token?: FungibleTokenDetailed
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
