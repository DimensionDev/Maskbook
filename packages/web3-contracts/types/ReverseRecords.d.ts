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

export interface ReverseRecords extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): ReverseRecords
    clone(): ReverseRecords
    methods: {
        getNames(addresses: string[]): NonPayableTransactionObject<string[]>
    }
    events: {
        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }
}
