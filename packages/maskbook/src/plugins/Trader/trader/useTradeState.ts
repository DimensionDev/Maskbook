import { useReducer } from 'react'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { TradeStrategy } from '../types'

export interface TradeState {
    strategy: TradeStrategy
    inputAmount: string
    outputAmount: string
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed
    inputTokenBalance: string
    outputTokenBalance: string
}

export enum TradeActionType {
    SWITCH_TOKEN,
    UPDATE_INPUT_TOKEN,
    UPDATE_OUTPUT_TOKEN,
    UPDATE_INPUT_AMOUNT,
    UPDATE_OUTPUT_AMOUNT,
    UPDATE_INPUT_TOKEN_BALANCE,
    UPDATE_OUTPUT_TOKEN_BALANCE,
}

export type SwapAction =
    | {
          type: TradeActionType.SWITCH_TOKEN
      }
    | {
          type: TradeActionType.UPDATE_INPUT_TOKEN
          token?: EtherTokenDetailed | ERC20TokenDetailed
      }
    | {
          type: TradeActionType.UPDATE_OUTPUT_TOKEN
          token?: EtherTokenDetailed | ERC20TokenDetailed
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

export function useTradeState(
    inputToken?: EtherTokenDetailed | ERC20TokenDetailed,
    outputToken?: EtherTokenDetailed | ERC20TokenDetailed,
) {
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
