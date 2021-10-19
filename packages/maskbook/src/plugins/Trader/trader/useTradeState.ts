import { useReducer } from 'react'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { TradeStrategy } from '../types'

export interface TradeState {
    strategy: TradeStrategy
    inputAmount: string
    outputAmount: string
    inputToken?: FungibleTokenDetailed
    outputToken?: FungibleTokenDetailed
    inputTokenBalance: string
    outputTokenBalance: string
}

export enum TradeActionType {
    SWITCH_TOKEN = 0,
    UPDATE_INPUT_TOKEN = 1,
    UPDATE_OUTPUT_TOKEN = 2,
    UPDATE_INPUT_AMOUNT = 3,
    UPDATE_OUTPUT_AMOUNT = 4,
    UPDATE_INPUT_TOKEN_BALANCE = 5,
    UPDATE_OUTPUT_TOKEN_BALANCE = 6,
}

export type SwapAction =
    | {
          type: TradeActionType.SWITCH_TOKEN
      }
    | {
          type: TradeActionType.UPDATE_INPUT_TOKEN
          token?: FungibleTokenDetailed
      }
    | {
          type: TradeActionType.UPDATE_OUTPUT_TOKEN
          token?: FungibleTokenDetailed
      }
    | {
          type: TradeActionType.UPDATE_INPUT_AMOUNT
          amount: string
      }
    | {
          type: TradeActionType.UPDATE_OUTPUT_AMOUNT
          amount: string
      }
    | {
          type: TradeActionType.UPDATE_INPUT_TOKEN_BALANCE
          balance: string
      }
    | {
          type: TradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE
          balance: string
      }

function reducer(state: TradeState, action: SwapAction): TradeState {
    const isExactIn = state.strategy === TradeStrategy.ExactIn
    switch (action.type) {
        case TradeActionType.SWITCH_TOKEN:
            return {
                ...state,
                strategy: isExactIn ? TradeStrategy.ExactOut : TradeStrategy.ExactIn,
                inputAmount: isExactIn ? '' : state.outputAmount,
                outputAmount: isExactIn ? state.inputAmount : '',
                inputToken: state.outputToken,
                outputToken: state.inputToken,
                inputTokenBalance: state.outputTokenBalance,
                outputTokenBalance: state.inputTokenBalance,
            }
        case TradeActionType.UPDATE_INPUT_TOKEN:
            return {
                ...state,
                inputToken: action.token,
            }
        case TradeActionType.UPDATE_OUTPUT_TOKEN:
            return {
                ...state,
                outputToken: action.token,
            }
        case TradeActionType.UPDATE_INPUT_AMOUNT:
            return {
                ...state,
                strategy: TradeStrategy.ExactIn,
                inputAmount: action.amount,
            }
        case TradeActionType.UPDATE_OUTPUT_AMOUNT:
            return {
                ...state,
                strategy: TradeStrategy.ExactOut,
                outputAmount: action.amount,
            }
        case TradeActionType.UPDATE_INPUT_TOKEN_BALANCE:
            return {
                ...state,
                inputTokenBalance: action.balance,
            }
        case TradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE:
            return {
                ...state,
                outputTokenBalance: action.balance,
            }
        default:
            return state
    }
}

export function useTradeState(inputToken?: FungibleTokenDetailed, outputToken?: FungibleTokenDetailed) {
    return useReducer(reducer, {
        strategy: TradeStrategy.ExactIn,
        inputAmount: '',
        outputAmount: '',
        inputToken,
        outputToken,
        inputTokenBalance: '',
        outputTokenBalance: '',
    })
}
