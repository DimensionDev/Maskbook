import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export interface WoofiSwapRequest {
    isNativeSellToken: boolean
    fromToken: FungibleTokenDetailed
    toToken: FungibleTokenDetailed
    fromAmount: string
    slippage: number
    userAddr: string
    rpc?: string
    chainId: number
}

export type WoofiSwapResponse = WoofiSwapSuccessResponse | WoofiSwapErrorResponse

export interface WoofiSwapSuccessResponse {
    status: 'ok'
    data: WoofiSwapResponseData
}

interface WoofiSwapResponseData {
    to_amount: string
    trading_fee: string
    single_fee_percentage: number
    price: number
    path: string[]
    route: string[]
}

interface WoofiSwapErrorResponse {
    status: 'fail'
    error?: {
        message: string
    }
}

export interface WoofiSwapData {
    toAmount: number
    path: string[]
    price: number
    tradingFee: string
    route: string[]
    singleFeePercentage: number
    fromAmount: number
    value: string
    slippage: number
    fromTokenSymbol: string | undefined
    toTokenSymbol: string | undefined
}
