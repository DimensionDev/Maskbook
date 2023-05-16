/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import type BN from 'bn.js'
import type { ContractOptions } from 'web3-eth-contract'
import type { EventLog } from 'web3-core'
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

export type OwnershipTransferred = ContractEventLog<{
    previousOwner: string
    newOwner: string
    0: string
    1: string
}>

export interface DepositPaymaster extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): DepositPaymaster
    clone(): DepositPaymaster
    methods: {
        COST_OF_POST(): NonPayableTransactionObject<string>

        PAYTOKEN_TO_MATIC_RATIO(arg0: number | string | BN): NonPayableTransactionObject<string>

        addDepositFor(account: string, amount: number | string | BN): NonPayableTransactionObject<void>

        addStake(extraUnstakeDelaySec: number | string | BN): PayableTransactionObject<void>

        adjustAdmin(account: string, admin: boolean): NonPayableTransactionObject<void>

        credits(arg0: string): NonPayableTransactionObject<string>

        deposit(): PayableTransactionObject<void>

        entryPoint(): NonPayableTransactionObject<string>

        estimateCost(
            userOp: [
                string,
                number | string | BN,
                string | number[],
                string | number[],
                number | string | BN,
                number | string | BN,
                number | string | BN,
                number | string | BN,
                number | string | BN,
                string,
                string | number[],
                string | number[],
            ],
        ): NonPayableTransactionObject<string>

        getDeposit(): NonPayableTransactionObject<string>

        isAdmin(arg0: string): NonPayableTransactionObject<boolean>

        owner(): NonPayableTransactionObject<string>

        payToken(): NonPayableTransactionObject<string>

        postOp(
            mode: number | string | BN,
            context: string | number[],
            actualGasCost: number | string | BN,
        ): NonPayableTransactionObject<void>

        renounceOwnership(): NonPayableTransactionObject<void>

        setEntryPoint(_entryPoint: string): NonPayableTransactionObject<void>

        setMaskToMaticRatio(ratio: (number | string | BN)[]): NonPayableTransactionObject<void>

        transferOwnership(newOwner: string): NonPayableTransactionObject<void>

        unlockStake(): NonPayableTransactionObject<void>

        validatePaymasterUserOp(
            userOp: [
                string,
                number | string | BN,
                string | number[],
                string | number[],
                number | string | BN,
                number | string | BN,
                number | string | BN,
                number | string | BN,
                number | string | BN,
                string,
                string | number[],
                string | number[],
            ],
            requestId: string | number[],
            maxCost: number | string | BN,
        ): NonPayableTransactionObject<string>

        withdraw(target: string, amount: number | string | BN): NonPayableTransactionObject<void>

        withdrawStake(withdrawAddress: string): NonPayableTransactionObject<void>

        withdrawTo(withdrawAddress: string, amount: number | string | BN): NonPayableTransactionObject<void>
    }
    events: {
        OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter
        OwnershipTransferred(options?: EventOptions, cb?: Callback<OwnershipTransferred>): EventEmitter

        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }

    once(event: 'OwnershipTransferred', cb: Callback<OwnershipTransferred>): void
    once(event: 'OwnershipTransferred', options: EventOptions, cb: Callback<OwnershipTransferred>): void
}
