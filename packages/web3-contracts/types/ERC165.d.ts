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

export interface ERC165 extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): ERC165
    clone(): ERC165
    methods: {
        supportsInterface(interfaceID: string | number[]): NonPayableTransactionObject<boolean>
    }
    events: {
        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }
}
