/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

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

export class ElectionToken extends Contract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions)
    clone(): ElectionToken
    methods: {
        approve(to: string, tokenId: number | string): TransactionObject<void>

        mintStateToken(claimer: string, state: number | string): TransactionObject<string>

        modify_admin(target: string, ifadmin: boolean): TransactionObject<void>

        modify_limits(state: number | string, delta: number | string): TransactionObject<void>

        safeTransferFrom(from: string, to: string, tokenId: number | string): TransactionObject<void>

        setApprovalForAll(operator: string, approved: boolean): TransactionObject<void>

        transferFrom(from: string, to: string, tokenId: number | string): TransactionObject<void>

        balanceOf(owner: string): TransactionObject<string>

        baseURI(): TransactionObject<string>

        check_availability(state: number | string): TransactionObject<string>

        getApproved(tokenId: number | string): TransactionObject<string>

        isApprovedForAll(owner: string, operator: string): TransactionObject<boolean>

        name(): TransactionObject<string>

        ownerOf(tokenId: number | string): TransactionObject<string>

        supportsInterface(interfaceId: string | number[]): TransactionObject<boolean>

        symbol(): TransactionObject<string>

        tokenByIndex(index: number | string): TransactionObject<string>

        tokenOfOwnerByIndex(owner: string, index: number | string): TransactionObject<string>

        tokenURI(tokenId: number | string): TransactionObject<string>

        totalSupply(): TransactionObject<string>
    }
    events: {
        Approval: ContractEvent<{
            owner: string
            approved: string
            tokenId: string
            0: string
            1: string
            2: string
        }>
        ApprovalForAll: ContractEvent<{
            owner: string
            operator: string
            approved: boolean
            0: string
            1: string
            2: boolean
        }>
        Transfer: ContractEvent<{
            from: string
            to: string
            tokenId: string
            0: string
            1: string
            2: string
        }>
        allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter
    }
}
