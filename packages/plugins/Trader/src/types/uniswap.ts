import type { BigNumber } from 'bignumber.js'
import type { Trade as V2Trade } from '@uniswap/v2-sdk'
import type { Trade as V3Trade } from '@uniswap/v3-sdk'
import type { Token, Currency, TradeType } from '@uniswap/sdk-core'

// [target, gasLimit, callData]
export type Call = [string, number, string]

export type TokenPair = [Token, Token]

export enum PairState {
    NOT_EXISTS = 0,
    EXISTS = 1,
    INVALID = 2,
}

export enum PoolState {
    LOADING = 0,
    NOT_EXISTS = 1,
    EXISTS = 2,
    INVALID = 3,
}

export interface SwapCall {
    address: string
    calldata: string
    value: string
}

export interface SwapCallEstimate {
    call: SwapCall
}

export interface SuccessfulCall extends SwapCallEstimate {
    call: SwapCall
    gasEstimate: BigNumber
}

export interface FailedCall extends SwapCallEstimate {
    call: SwapCall
    error: Error
}

export type Trade = V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType>
