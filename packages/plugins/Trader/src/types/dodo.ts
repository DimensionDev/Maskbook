import type { Web3Helper } from '@masknet/web3-helpers'

interface SwapRouteRequest {
    isNativeSellToken: boolean
    fromToken: Web3Helper.FungibleTokenAll
    toToken: Web3Helper.FungibleTokenAll
    fromAmount: string
    slippage: number
    userAddr: string
    rpc?: string
    chainId: number
}

type SwapRouteResponse = SwapRouteSuccessResponse | SwapRouteErrorResponse

export interface SwapRouteSuccessResponse {
    code: number
    status: 200
    data: SwapRouteData
    value: string
}

interface SwapRouteErrorResponse {
    code: number
    status: number
    data: string | undefined
}

interface SwapRouteData {
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
    slippage: number
    fromTokenSymbol: string
    toTokenSymbol: string
}
