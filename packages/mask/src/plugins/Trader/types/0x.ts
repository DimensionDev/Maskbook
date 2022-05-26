import type { ZrxTradePool } from './trader'

export interface SwapOrder {
    chainId: string
    exchangeAddress: string
    makerAddress: string
    takerAddress: string
    makerAssetData: string
    takerAssetData: string
    makerAssetAmount: string
    takerAssetAmount: string
    makerFee: string
    takerFee: string
    expirationTimeSeconds: string
    salt: string
    makerFeeAssetData: string
    takerFeeAssetData: string
    feeRecipientAddress: string
    senderAddress: string
    signature: string
}

export interface SwapPorportion {
    name: ZrxTradePool
    proportion: string
}

// Learn more from https://0x.org/docs/api#request-1
export interface SwapQuoteRequest {
    sellToken: string
    buyToken: string
    sellAmount?: string
    buyAmount?: string
    /**
     * 1 - 100
     */
    slippagePercentage?: number
    gasPrice?: string
    takerAddress?: string
    includedSources?: ZrxTradePool[]
    excludedSources?: ZrxTradePool[]
    skipValidation?: boolean
    intentOnFilling?: boolean
    feeRecipient?: string
    /**
     * 1 - 100
     */
    buyTokenPercentageFee?: number
    affiliateAddress?: string
}

// Learn more from https://0x.org/docs/api#response-1
export interface SwapQuoteResponse {
    price: string
    guaranteedPrice: string
    to: string
    data: string
    value: string
    gasPrice: string
    gas: string
    estimatedGas: string
    protocolFee: string
    minimumProtocolFee: string
    buyAmount: string
    sellAmount: string
    sources: SwapPorportion[]
    buyTokenAddress: string
    sellTokenAddress: string
    orders: SwapOrder[]
    estimatedGasTokenRefund: string
    allowanceTarget: string
    buyTokenToEthRate: string
    sellTokenToEthRate: string
}

export interface SwapValidationErrorResponse {
    code: number
    reason: string
    validationErrors: {
        code: number
        field: string
        reason: string
    }[]
}

export interface SwapServerErrorResponse {
    reason: string
}

export type SwapErrorResponse = SwapValidationErrorResponse | SwapServerErrorResponse
