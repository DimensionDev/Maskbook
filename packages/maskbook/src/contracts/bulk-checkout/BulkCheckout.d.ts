/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractOptions } from 'web3-eth-contract'
import { EventLog } from 'web3-core'
import { EventEmitter } from 'events'
import { ContractEvent, Callback, TransactionObject, BlockType } from '../types'

interface EventOptions {
    filter?: object
    fromBlock?: BlockType
    topics?: string[]
}

export class BulkCheckout extends Contract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions)
    clone(): BulkCheckout
    methods: {
        donate(_donations: { token: string; amount: number | string; dest: string }[]): TransactionObject<void>

        owner(): TransactionObject<string>

        pause(): TransactionObject<void>

        paused(): TransactionObject<boolean>

        renounceOwnership(): TransactionObject<void>

        transferOwnership(newOwner: string): TransactionObject<void>

        unpause(): TransactionObject<void>

        withdrawEther(_dest: string): TransactionObject<void>

        withdrawToken(_tokenAddress: string, _dest: string): TransactionObject<void>
    }
    events: {
        DonationSent: ContractEvent<{
            token: string
            amount: string
            dest: string
            donor: string
            0: string
            1: string
            2: string
            3: string
        }>
        OwnershipTransferred: ContractEvent<{
            previousOwner: string
            newOwner: string
            0: string
            1: string
        }>
        Paused: ContractEvent<string>
        TokenWithdrawn: ContractEvent<{
            token: string
            amount: string
            dest: string
            0: string
            1: string
            2: string
        }>
        Unpaused: ContractEvent<string>
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter
    }
}
