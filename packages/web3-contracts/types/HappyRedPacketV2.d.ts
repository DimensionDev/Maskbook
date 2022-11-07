/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from 'bn.js'
import { ContractOptions } from 'web3-eth-contract'
import { EventLog } from 'web3-core'
import { EventEmitter } from 'events'
import {
    Callback,
    PayableTransactionObject,
    NonPayableTransactionObject,
    BlockType,
    ContractEventLog,
    BaseContract,
} from './types.js'

interface EventOptions {
    filter?: object
    fromBlock?: BlockType
    topics?: string[]
}

export type ClaimSuccess = ContractEventLog<{
    id: string
    claimer: string
    claimed_value: string
    token_address: string
    0: string
    1: string
    2: string
    3: string
}>
export type CreationSuccess = ContractEventLog<{
    total: string
    id: string
    name: string
    message: string
    creator: string
    creation_time: string
    token_address: string
    0: string
    1: string
    2: string
    3: string
    4: string
    5: string
    6: string
}>
export type RefundSuccess = ContractEventLog<{
    id: string
    token_address: string
    remaining_balance: string
    0: string
    1: string
    2: string
}>

export interface HappyRedPacketV2 extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): HappyRedPacketV2
    clone(): HappyRedPacketV2
    methods: {
        claim(
            id: string | number[],
            password: string,
            recipient: string,
            validation: string | number[],
        ): NonPayableTransactionObject<string>

        create_red_packet(
            _hash: string | number[],
            _number: number | string | BN,
            _ifrandom: boolean,
            _duration: number | string | BN,
            _seed: string | number[],
            _message: string,
            _name: string,
            _token_type: number | string | BN,
            _token_addr: string,
            _total_tokens: number | string | BN,
        ): PayableTransactionObject<void>

        refund(id: string | number[]): NonPayableTransactionObject<void>

        check_availability(id: string | number[]): NonPayableTransactionObject<{
            token_address: string
            balance: string
            total: string
            claimed: string
            expired: boolean
            claimed_amount: string
            0: string
            1: string
            2: string
            3: string
            4: boolean
            5: string
        }>

        contract_creator(): NonPayableTransactionObject<string>
    }
    events: {
        ClaimSuccess(cb?: Callback<ClaimSuccess>): EventEmitter
        ClaimSuccess(options?: EventOptions, cb?: Callback<ClaimSuccess>): EventEmitter

        CreationSuccess(cb?: Callback<CreationSuccess>): EventEmitter
        CreationSuccess(options?: EventOptions, cb?: Callback<CreationSuccess>): EventEmitter

        RefundSuccess(cb?: Callback<RefundSuccess>): EventEmitter
        RefundSuccess(options?: EventOptions, cb?: Callback<RefundSuccess>): EventEmitter

        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }

    once(event: 'ClaimSuccess', cb: Callback<ClaimSuccess>): void
    once(event: 'ClaimSuccess', options: EventOptions, cb: Callback<ClaimSuccess>): void

    once(event: 'CreationSuccess', cb: Callback<CreationSuccess>): void
    once(event: 'CreationSuccess', options: EventOptions, cb: Callback<CreationSuccess>): void

    once(event: 'RefundSuccess', cb: Callback<RefundSuccess>): void
    once(event: 'RefundSuccess', options: EventOptions, cb: Callback<RefundSuccess>): void
}
