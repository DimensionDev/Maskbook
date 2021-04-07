/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from 'bn.js'
import { EventLog, TransactionReceipt } from 'web3-core/types'
import { EventEmitter } from 'events'
// @ts-ignore
import PromiEvent from 'promievent'

interface EstimateGasOptions {
    from?: string
    gas?: number
    value?: number | string | BN
}

interface EventOptions {
    filter?: object
    fromBlock?: BlockType
    topics?: string[]
}

export type Callback<T> = (error: Error, result: T) => void
export interface TransactionObject<T> {
    arguments: any[]
    call(options?: EstimateGasOptions): Promise<T>
    send(
        options?: EstimateGasOptions,
        callback?: (error: Error | null, hash: string) => void,
    ): PromiEvent<TransactionReceipt>
    estimateGas(options?: EstimateGasOptions): Promise<number>
    encodeABI(): string
}
export interface ContractEventLog<T> extends EventLog {
    returnValues: T
}
export interface ContractEventEmitter<T> extends EventEmitter {
    on(event: 'connected', listener: (subscriptionId: string) => void): this
    on(event: 'data' | 'changed', listener: (event: ContractEventLog<T>) => void): this
    on(event: 'error', listener: (error: Error) => void): this
}
export type ContractEvent<T> = (options?: EventOptions, cb?: Callback<ContractEventLog<T>>) => ContractEventEmitter<T>

export interface Tx {
    nonce?: string | number
    chainId?: string | number
    from?: string
    to?: string
    data?: string
    value?: string | number
    gas?: string | number
    gasPrice?: string | number
}

export interface TransactionObject<T> {
    arguments: any[]
    call(tx?: Tx): Promise<T>
    send(tx?: Tx, callback?: (error: Error | null, hash: string) => void): PromiEvent<TransactionReceipt>
    estimateGas(tx?: Tx): Promise<number>
    encodeABI(): string
}

export type BlockType = 'latest' | 'pending' | 'genesis' | number
