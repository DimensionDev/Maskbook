import type { Trade as V2Trade } from '@uniswap/v2-sdk'
import type { Trade as V3Trade } from '@uniswap/v3-sdk'
import type { Currency, TradeType } from '@uniswap/sdk-core'

export type Trade = V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType>

export interface SwapCall {
    address: string
    calldata: string
    value: string
}
