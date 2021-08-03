import type { FungibleTokenDetailed } from '@masknet/web3-shared'

export interface SwapRouteRequest {
    isNativeSellToken: boolean
    fromToken: FungibleTokenDetailed
    toToken: FungibleTokenDetailed
    fromAmount: string
    slippage: number
    userAddr: string
    rpc?: string
    chainId: number
}

export interface SwapRouteResponse {
    status: number
    data: SwapRouteData
}

export interface SwapRouteData {
    data: string
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
}

export interface SwapRouteErrorResponse {
    code?: number
    status?: number
    data: string
}
