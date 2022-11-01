import type { Web3Helper } from '@masknet/web3-helpers'
import type { FungibleToken } from '@masknet/web3-shared-base'

export interface SwapRouteRequest {
    isNativeSellToken: boolean
    fromToken: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    toToken: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    fromAmount: string
    slippage: number
    userAddr: string
    rpc?: string
    chainId: number
}

export type SwapRouteResponse = SwapRouteSuccessResponse | SwapRouteErrorResponse

export interface SwapRouteSuccessResponse {
    code: number
    status: 200
    data: SwapRouteData
}

export interface SwapRouteErrorResponse {
    code: number
    status: number
    data: string | undefined
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
    slippage: number
    fromTokenSymbol: string
    toTokenSymbol: string
}
