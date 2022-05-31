import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { TradeStrategy } from '../types'
import type { FungibleToken } from '@masknet/web3-shared-base'

export type SwapBancorRequest = {
    strategy: TradeStrategy
    slippage: number
    fromToken: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
    toToken: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
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
        value: number
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
