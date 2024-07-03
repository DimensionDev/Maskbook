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

export type CancelSuccess = ContractEventLog<{
    box_id: string
    creator: string
    0: string
    1: string
}>
export type ClaimPayment = ContractEventLog<{
    creator: string
    box_id: string
    token_address: string
    amount: string
    timestamp: string
    0: string
    1: string
    2: string
    3: string
    4: string
}>
export type CreationSuccess = ContractEventLog<{
    creator: string
    nft_address: string
    box_id: string
    name: string
    start_time: string
    end_time: string
    sell_all: boolean
    0: string
    1: string
    2: string
    3: string
    4: string
    5: string
    6: boolean
}>
export type OpenSuccess = ContractEventLog<{
    box_id: string
    customer: string
    nft_address: string
    amount: string
    0: string
    1: string
    2: string
    3: string
}>
export type OwnershipTransferred = ContractEventLog<{
    previousOwner: string
    newOwner: string
    0: string
    1: string
}>

export interface MaskBox extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): MaskBox
    clone(): MaskBox
    methods: {
        addAdmin(addrs: string[]): NonPayableTransactionObject<void>

        addNftIntoBox(
            box_id: number | string | BN,
            nft_id_list: (number | string | BN)[],
        ): NonPayableTransactionObject<void>

        addWhitelist(addrs: string[]): NonPayableTransactionObject<void>

        admin(arg0: string): NonPayableTransactionObject<boolean>

        cancelBox(box_id: number | string | BN): NonPayableTransactionObject<void>

        claimPayment(box_ids: (number | string | BN)[]): NonPayableTransactionObject<void>

        createBox(
            nft_address: string,
            name: string,
            payment: [string, number | string | BN][],
            personal_limit: number | string | BN,
            start_time: number | string | BN,
            end_time: number | string | BN,
            sell_all: boolean,
            nft_id_list: (number | string | BN)[],
            qualification: string,
            holder_token_addr: string,
            holder_min_token_amount: number | string | BN,
            qualification_data: string | number[],
        ): NonPayableTransactionObject<void>

        getBoxInfo(box_id: number | string | BN): NonPayableTransactionObject<{
            creator: string
            nft_address: string
            name: string
            personal_limit: string
            qualification: string
            holder_token_addr: string
            holder_min_token_amount: string
            qualification_data: string
            0: string
            1: string
            2: string
            3: string
            4: string
            5: string
            6: string
            7: string
        }>

        getBoxStatus(box_id: number | string | BN): NonPayableTransactionObject<{
            payment: [string, string, string][]
            started: boolean
            expired: boolean
            canceled: boolean
            remaining: string
            total: string
            0: [string, string, string][]
            1: boolean
            2: boolean
            3: boolean
            4: string
            5: string
        }>

        getNftListForSale(
            box_id: number | string | BN,
            cursor: number | string | BN,
            amount: number | string | BN,
        ): NonPayableTransactionObject<string[]>

        getPurchasedNft(box_id: number | string | BN, customer: string): NonPayableTransactionObject<string[]>

        initialize(): NonPayableTransactionObject<void>

        openBox(
            box_id: number | string | BN,
            amount: number | string | BN,
            payment_token_index: number | string | BN,
            proof: string | number[],
        ): PayableTransactionObject<void>

        owner(): NonPayableTransactionObject<string>

        removeAdmin(addrs: string[]): NonPayableTransactionObject<void>

        removeWhitelist(addrs: string[]): NonPayableTransactionObject<void>

        renounceOwnership(): NonPayableTransactionObject<void>

        setQualificationData(
            box_id: number | string | BN,
            qualification_data: string | number[],
        ): NonPayableTransactionObject<void>

        transferOwnership(newOwner: string): NonPayableTransactionObject<void>

        whitelist(arg0: string): NonPayableTransactionObject<boolean>
    }
    events: {
        CancelSuccess(cb?: Callback<CancelSuccess>): EventEmitter
        CancelSuccess(options?: EventOptions, cb?: Callback<CancelSuccess>): EventEmitter

        ClaimPayment(cb?: Callback<ClaimPayment>): EventEmitter
        ClaimPayment(options?: EventOptions, cb?: Callback<ClaimPayment>): EventEmitter

        CreationSuccess(cb?: Callback<CreationSuccess>): EventEmitter
        CreationSuccess(options?: EventOptions, cb?: Callback<CreationSuccess>): EventEmitter

        OpenSuccess(cb?: Callback<OpenSuccess>): EventEmitter
        OpenSuccess(options?: EventOptions, cb?: Callback<OpenSuccess>): EventEmitter

        OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter
        OwnershipTransferred(options?: EventOptions, cb?: Callback<OwnershipTransferred>): EventEmitter

        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }

    once(event: 'CancelSuccess', cb: Callback<CancelSuccess>): void
    once(event: 'CancelSuccess', options: EventOptions, cb: Callback<CancelSuccess>): void

    once(event: 'ClaimPayment', cb: Callback<ClaimPayment>): void
    once(event: 'ClaimPayment', options: EventOptions, cb: Callback<ClaimPayment>): void

    once(event: 'CreationSuccess', cb: Callback<CreationSuccess>): void
    once(event: 'CreationSuccess', options: EventOptions, cb: Callback<CreationSuccess>): void

    once(event: 'OpenSuccess', cb: Callback<OpenSuccess>): void
    once(event: 'OpenSuccess', options: EventOptions, cb: Callback<OpenSuccess>): void

    once(event: 'OwnershipTransferred', cb: Callback<OwnershipTransferred>): void
    once(event: 'OwnershipTransferred', options: EventOptions, cb: Callback<OwnershipTransferred>): void
}
