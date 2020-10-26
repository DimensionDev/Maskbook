import { useReducer } from 'react'
import type { Token } from '../../../web3/types'
import { TradeStrategy } from '../types'

export interface SwapState {
    strategy: TradeStrategy
    inputAmount: string
    outputAmount: string
    inputToken?: Token
    outputToken?: Token
}

export enum SwapActionType {
    SWITCH_TOKEN,
    UPDATE_INPUT_TOKEN,
    UPDATE_OUTPUT_TOKEN,
    UPDATE_INPUT_AMOUNT,
    UPDATE_OUTPUT_AMOUNT,
}

export type SwapAction =
    | {
          type: SwapActionType.SWITCH_TOKEN
      }
    | {
          type: SwapActionType.UPDATE_INPUT_TOKEN
          token?: Token
      }
    | {
          type: SwapActionType.UPDATE_OUTPUT_TOKEN
          token?: Token
      }
    | {
          type: SwapActionType.UPDATE_INPUT_AMOUNT
          amount: string
      }
    | {
          type: SwapActionType.UPDATE_OUTPUT_AMOUNT
          amount: string
      }

function reducer(state: SwapState, action: SwapAction): SwapState {
    switch (action.type) {
        case SwapActionType.SWITCH_TOKEN:
            return {
                ...state,
                strategy: state.strategy === TradeStrategy.ExactIn ? TradeStrategy.ExactOut : TradeStrategy.ExactIn,
                inputAmount: state.outputAmount,
                outputAmount: state.inputAmount,
                inputToken: state.outputToken,
                outputToken: state.inputToken,
            }
        case SwapActionType.UPDATE_INPUT_TOKEN:
            return {
                ...state,
                inputToken: action.token,
            }
        case SwapActionType.UPDATE_OUTPUT_TOKEN:
            return {
                ...state,
                outputToken: action.token,
            }
        case SwapActionType.UPDATE_INPUT_AMOUNT:
            return {
                ...state,
                strategy: TradeStrategy.ExactIn,
                inputAmount: action.amount,
            }
        case SwapActionType.UPDATE_OUTPUT_AMOUNT:
            return {
                ...state,
                strategy: TradeStrategy.ExactOut,
                outputAmount: action.amount,
            }
        default:
            return state
    }
}

export function useSwapState(inputToken?: Token, outputToken?: Token) {
    return useReducer(reducer, {
        strategy: TradeStrategy.ExactIn,
        inputAmount: '0',
        outputAmount: '0',
        inputToken,
        outputToken,
    })
}
