/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import type BN from 'bn.js'
import type { ContractOptions } from 'web3-eth-contract'
import type { EventLog } from 'web3-types'
import type { EventEmitter } from 'events'
import type {
    Callback,
    PayableTransactionObject,
    NonPayableTransactionObject,
    BlockType,
    ContractEventLog,
    BaseContract,
} from './types.js'

export interface EventOptions {
    filter?: object
    fromBlock?: BlockType
    topics?: string[]
}

export interface Quoter extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): Quoter
    clone(): Quoter
    methods: {
        WETH9(): NonPayableTransactionObject<string>

        factory(): NonPayableTransactionObject<string>

        quoteExactInput(path: string | number[], amountIn: number | string | BN): NonPayableTransactionObject<string>

        quoteExactInputSingle(
            tokenIn: string,
            tokenOut: string,
            fee: number | string | BN,
            amountIn: number | string | BN,
            sqrtPriceLimitX96: number | string | BN,
        ): NonPayableTransactionObject<string>

        quoteExactOutput(path: string | number[], amountOut: number | string | BN): NonPayableTransactionObject<string>

        quoteExactOutputSingle(
            tokenIn: string,
            tokenOut: string,
            fee: number | string | BN,
            amountOut: number | string | BN,
            sqrtPriceLimitX96: number | string | BN,
        ): NonPayableTransactionObject<string>

        uniswapV3SwapCallback(
            amount0Delta: number | string | BN,
            amount1Delta: number | string | BN,
            path: string | number[],
        ): NonPayableTransactionObject<void>
    }
    events: {
        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }
}
