import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export interface SwapOORequest {
    isNativeSellToken: boolean
    fromToken: FungibleTokenDetailed
    toToken: FungibleTokenDetailed
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
}

export interface SwapOOErrorResponse {
    code: number
    status: number
    data: string | undefined
}

export interface SwapOOData {
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
    minOutAmount: number
}
