/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from 'bn.js'
import { Contract, ContractOptions } from 'web3-eth-contract'
import { EventLog } from 'web3-core'
import { EventEmitter } from 'events'
import { ContractEvent, Callback, TransactionObject, BlockType } from './types'

interface EventOptions {
    filter?: object
    fromBlock?: BlockType
    topics?: string[]
}

export class Qualification extends Contract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions)
    clone(): Qualification
    methods: {
        ifQualified(testee: string): TransactionObject<boolean>

        logQualified(testee: string): TransactionObject<boolean>

        supportsInterface(interfaceId: string | number[]): TransactionObject<boolean>
    }
    events: {
        Qualification: ContractEvent<{
            testee: string
            qualified: boolean
            number: string
            timestamp: string
            0: string
            1: boolean
            2: string
            3: string
        }>
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter
    }
}
