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
} from './types'

interface EventOptions {
    filter?: object
    fromBlock?: BlockType
    topics?: string[]
}

export interface FixedPriceSale extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): FixedPriceSale
    clone(): FixedPriceSale
    methods: {
        canBid(
            arg0: string,
            arg1: number | string | BN,
            arg2: string | number[],
            arg3: string,
            arg4: number | string | BN,
            arg5: string,
            arg6: number | string | BN,
            arg7: number | string | BN,
        ): NonPayableTransactionObject<boolean>

        canClaim(
            proxy: string,
            deadline: number | string | BN,
            params: string | number[],
            arg3: string,
            bidPrice: number | string | BN,
            arg5: string,
            arg6: number | string | BN,
            arg7: number | string | BN,
        ): NonPayableTransactionObject<boolean>
    }
    events: {
        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }
}
