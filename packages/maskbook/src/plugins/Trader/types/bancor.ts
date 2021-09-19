import type { FungibleTokenDetailed, ChainId } from '@masknet/web3-shared'
import type { TradeStrategy } from '../types'

export type SwapBancorRequest = {
    strategy: TradeStrategy
    slippage: number
    fromToken: FungibleTokenDetailed
    toToken: FungibleTokenDetailed
    fromAmount: string | undefined
    toAmount: string | undefined
    user: string
    chainId: ChainId.Mainnet | ChainId.Ropsten
    minimumReceived: string
    fromTokenSymbol?: string
    toTokenSymbol?: string
}

// https://docs.bancor.network/rest-api/api-reference
export type TradeTransactionCreationResponse = [
    {
        dlt_type: string
        transaction: {
            data: string
            to: string
            gasPrice: string
            nonce: number
            from: string
            value: number
        }
    },
]

export type ExpectedTargetAmountResponse = {
    amount: string
}

export type ExpectedSourceAmountResponse = {
    amount: string
}
