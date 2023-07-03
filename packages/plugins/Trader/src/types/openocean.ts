import type { Web3Helper } from '@masknet/web3-helpers'

export interface SwapOORequest {
    isNativeSellToken: boolean
    fromToken: Web3Helper.FungibleTokenAll
    toToken: Web3Helper.FungibleTokenAll
    fromAmount: string
    slippage: number
    userAddr?: string
    rpc?: string
    chainId: number
}

export type SwapOOResponse = SwapOOSuccessResponse | SwapOOErrorResponse

export interface SwapOOSuccessResponse {
    code: number
    status: 200
    data: SwapOOData
    value: string
}

export interface SwapOOErrorResponse {
    code: number
    status: number
    data: string | undefined
}

export interface SwapOOData {
    data: string
    estimatedGas: string
    priceImpact: number
    resAmount: number
    resCostGas: number
    resPricePerFromToken: number
    resPricePerToToken: number
    targetApproveAddr: string
    targetDecimals: number
    to: string
    useSource: string
    fromAmount: number
    value: string
    slippage: number
    fromTokenSymbol: string
    toTokenSymbol: string
    minOutAmount: number
}
