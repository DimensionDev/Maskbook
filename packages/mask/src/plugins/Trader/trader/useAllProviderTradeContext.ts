import { useReducer, useState } from 'react'
import { useAllTradeComputed } from './useAllTradeComputed'
import { createContainer } from 'unstated-next'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export interface AllProviderTradeState {
    inputAmount: string
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
    inputTokenBalance: string
    outputTokenBalance: string
}

export enum AllProviderTradeActionType {
    UPDATE_INPUT_TOKEN = 0,
    UPDATE_OUTPUT_TOKEN = 1,
    UPDATE_INPUT_AMOUNT = 2,
    UPDATE_INPUT_TOKEN_BALANCE = 3,
    UPDATE_OUTPUT_TOKEN_BALANCE = 4,
}

export type AllProviderSwapAction =
    | {
          type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN
          token?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
      }
    | {
          type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN
          token?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
      }
    | {
          type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT
          amount: string
      }
    | {
          type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE
          balance: string
      }
    | {
          type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE
          balance: string
      }

function reducer(state: AllProviderTradeState, action: AllProviderSwapAction): AllProviderTradeState {
    switch (action.type) {
        case AllProviderTradeActionType.UPDATE_INPUT_TOKEN:
            return {
                ...state,
                inputToken: action.token,
            }
        case AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN:
            return {
                ...state,
                outputToken: action.token,
            }
        case AllProviderTradeActionType.UPDATE_INPUT_AMOUNT:
            return {
                ...state,
                inputAmount: action.amount,
            }
        case AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE:
            return {
                ...state,
                inputTokenBalance: action.balance,
            }
        case AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE:
            return {
                ...state,
                outputTokenBalance: action.balance,
            }
    }
}

export function useAllProviderTradeContext() {
    const [tradeStore, dispatchTradeStore] = useReducer(reducer, {
        inputAmount: '',
        inputTokenBalance: '0',
        outputTokenBalance: '0',
    })
    const [isSwapping, setIsSwapping] = useState(false)
    const [temporarySlippage, setTemporarySlippage] = useState<number | undefined>()
    const { inputAmount, inputToken, outputToken } = tradeStore
    const allTradeComputed = useAllTradeComputed(inputAmount, inputToken, outputToken, temporarySlippage)

    return {
        isSwapping,
        setIsSwapping,
        tradeState: [tradeStore, dispatchTradeStore] as const,
        temporarySlippage,
        setTemporarySlippage,
        allTradeComputed,
    }
}

export const AllProviderTradeContext = createContainer(useAllProviderTradeContext)
