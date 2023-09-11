import type { ChainId } from '@masknet/web3-shared-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { TradeStrategy } from '../types/index.js'

export type SwapBancorRequest = {
    strategy: TradeStrategy
    slippage: number
    fromToken: Web3Helper.FungibleTokenAll
    toToken: Web3Helper.FungibleTokenAll
    fromAmount: string | undefined
    toAmount: string | undefined
    user: string
    chainId: ChainId.Mainnet | ChainId.Ropsten
    minimumReceived: string
    fromTokenSymbol?: string
    toTokenSymbol?: string
}

type TradeTransaction = {
    dlt_type: string
    transaction: {
        data: string
        to: string
        gasPrice: string
        nonce: number
        from: string
        value: string
    }
}

// https://docs.bancor.network/rest-api/api-reference
export type TradeTransactionCreationResponse = [TradeTransaction] | [TradeTransaction, TradeTransaction]

export type ExpectedTargetAmountResponse = {
    amount: string
}

export type ExpectedSourceAmountResponse = {
    amount: string
}

export type BancorApiErrorResponse = {
    error: {
        status: number
        messages?: string[]
    }
}
