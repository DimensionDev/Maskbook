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

export type GasPriceOver = ContractEventLog<{}>
export type QualificationEvent = ContractEventLog<{
    account: string
    qualified: boolean
    blockNumber: string
    timestamp: string
    0: string
    1: boolean
    2: string
    3: string
}>
export type Unlucky = ContractEventLog<{}>

export interface Qualification extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): Qualification
    clone(): Qualification
    methods: {
        get_creation_time(): NonPayableTransactionObject<string>

        get_name(): NonPayableTransactionObject<string>

        get_start_time(): NonPayableTransactionObject<string>

        ifQualified(account: string): NonPayableTransactionObject<boolean>

        isLucky(account: string): NonPayableTransactionObject<boolean>

        logQualified(account: string, ito_start_time: number | string | BN): NonPayableTransactionObject<boolean>

        lucky_factor(): NonPayableTransactionObject<string>

        max_gas_price(): NonPayableTransactionObject<string>

        min_token_amount(): NonPayableTransactionObject<string>

        set_lucky_factor(_lucky_factor: number | string | BN): NonPayableTransactionObject<void>

        set_max_gas_price(_max_gas_price: number | string | BN): NonPayableTransactionObject<void>

        set_min_token_amount(_min_token_amount: number | string | BN): NonPayableTransactionObject<void>

        set_start_time(_start_time: number | string | BN): NonPayableTransactionObject<void>

        set_token_addr(_token_addr: string): NonPayableTransactionObject<void>

        supportsInterface(interfaceId: string | number[]): NonPayableTransactionObject<boolean>

        token_addr(): NonPayableTransactionObject<string>
    }
    events: {
        GasPriceOver(cb?: Callback<GasPriceOver>): EventEmitter
        GasPriceOver(options?: EventOptions, cb?: Callback<GasPriceOver>): EventEmitter

        Qualification(cb?: Callback<QualificationEvent>): EventEmitter
        Qualification(options?: EventOptions, cb?: Callback<QualificationEvent>): EventEmitter

        Unlucky(cb?: Callback<Unlucky>): EventEmitter
        Unlucky(options?: EventOptions, cb?: Callback<Unlucky>): EventEmitter

        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }

    once(event: 'GasPriceOver', cb: Callback<GasPriceOver>): void
    once(event: 'GasPriceOver', options: EventOptions, cb: Callback<GasPriceOver>): void

    once(event: 'Qualification', cb: Callback<QualificationEvent>): void
    once(event: 'Qualification', options: EventOptions, cb: Callback<QualificationEvent>): void

    once(event: 'Unlucky', cb: Callback<Unlucky>): void
    once(event: 'Unlucky', options: EventOptions, cb: Callback<Unlucky>): void
}
