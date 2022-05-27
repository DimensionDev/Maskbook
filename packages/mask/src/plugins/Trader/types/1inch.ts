import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'

// Learn more from https://docs.1inch.io/docs/aggregation-protocol/api/swap-params
export interface SwapQuoteOneResponse {
    fromToken: TokenOneInch
    toToken: TokenOneInch
    toTokenAmount: string // result amount of toToken in minimal divisible units
    fromTokenAmount: string // input amount of fromToken in minimal divisible units
    protocols: [OneInchProtocols] // route
    estimatedGas: number
    tx: OneInchTx
    slippage: number
    resPricePerToToken: number
    resPricePerFromToken: number
    priceImpact: number
}

export interface TokenOneInch {
    symbol: string
    name: string
    address: string
    decimals: number
    logoURI: string
}

export interface OneInchTx {
    from: string
    to: string
    data: string // call data
    value: string // amount of eth (in wei) will be sent to the contract address
    gasPrice: string
    gas: number // rough estimate, increase gas value by ~25%
}
export interface OneInchProtocols {
    name: string
    part: number
    fromTokenAddress: string
    toTokenAddress: string
}
// more information https://docs.1inch.io/docs/aggregation-protocol/api/quote-params
export interface SwapQuoteOneRequest {
    isNativeSellToken: boolean
    fromTokenAddress: FungibleTokenDetailed
    toTokenAddress: FungibleTokenDetailed
    amount: string | undefined
    fromAddress: string
    slippage: number
    rpc?: string
    chainId: number
}

export interface SwapOneSuccessResponse {
    code: number
    status: 200
    data: SwapQuoteOneResponse
}

export interface SwapOneValidationErrorResponse {
    code: number
    reason: string
    validationErrors: {
        code: number
        field: string
        reason: string
    }[]
}

export interface SwapOneServerErrorResponse {
    reason: string
    validationErrors: {
        code: number
        field: string
        reason: string
    }[]
}

export type SwapOneErrorResponse = SwapOneValidationErrorResponse | SwapOneServerErrorResponse
