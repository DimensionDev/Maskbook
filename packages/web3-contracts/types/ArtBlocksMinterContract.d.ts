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

export type PricePerTokenInWeiUpdated = ContractEventLog<{
    _projectId: string
    _pricePerTokenInWei: string
    0: string
    1: string
}>
export type ProjectCurrencyInfoUpdated = ContractEventLog<{
    _projectId: string
    _currencyAddress: string
    _currencySymbol: string
    0: string
    1: string
    2: string
}>
export type PurchaseToDisabledUpdated = ContractEventLog<{
    _projectId: string
    _purchaseToDisabled: boolean
    0: string
    1: boolean
}>

export interface ArtBlocksMinterContract extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): ArtBlocksMinterContract
    clone(): ArtBlocksMinterContract
    methods: {
        contractMintable(arg0: number | string | BN): NonPayableTransactionObject<boolean>

        genArt721CoreAddress(): NonPayableTransactionObject<string>

        getPriceInfo(_projectId: number | string | BN): NonPayableTransactionObject<{
            isConfigured: boolean
            tokenPriceInWei: string
            currencySymbol: string
            currencyAddress: string
            0: boolean
            1: string
            2: string
            3: string
        }>

        minterFilterAddress(): NonPayableTransactionObject<string>

        minterType(): NonPayableTransactionObject<string>

        projectMaxHasBeenInvoked(arg0: number | string | BN): NonPayableTransactionObject<boolean>

        projectMaxInvocations(arg0: number | string | BN): NonPayableTransactionObject<string>

        projectMintCounter(arg0: string, arg1: number | string | BN): NonPayableTransactionObject<string>

        projectMintLimit(arg0: number | string | BN): NonPayableTransactionObject<string>

        purchase(_projectId: number | string | BN): PayableTransactionObject<string>

        purchaseTo(_to: string, _projectId: number | string | BN): PayableTransactionObject<string>

        purchaseToDisabled(arg0: number | string | BN): NonPayableTransactionObject<boolean>

        setProjectMaxInvocations(_projectId: number | string | BN): NonPayableTransactionObject<void>

        setProjectMintLimit(
            _projectId: number | string | BN,
            _limit: number | string | BN,
        ): NonPayableTransactionObject<void>

        toggleContractMintable(_projectId: number | string | BN): NonPayableTransactionObject<void>

        togglePurchaseToDisabled(_projectId: number | string | BN): NonPayableTransactionObject<void>

        updatePricePerTokenInWei(
            _projectId: number | string | BN,
            _pricePerTokenInWei: number | string | BN,
        ): NonPayableTransactionObject<void>
    }
    events: {
        PricePerTokenInWeiUpdated(cb?: Callback<PricePerTokenInWeiUpdated>): EventEmitter
        PricePerTokenInWeiUpdated(options?: EventOptions, cb?: Callback<PricePerTokenInWeiUpdated>): EventEmitter

        ProjectCurrencyInfoUpdated(cb?: Callback<ProjectCurrencyInfoUpdated>): EventEmitter
        ProjectCurrencyInfoUpdated(options?: EventOptions, cb?: Callback<ProjectCurrencyInfoUpdated>): EventEmitter

        PurchaseToDisabledUpdated(cb?: Callback<PurchaseToDisabledUpdated>): EventEmitter
        PurchaseToDisabledUpdated(options?: EventOptions, cb?: Callback<PurchaseToDisabledUpdated>): EventEmitter

        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }

    once(event: 'PricePerTokenInWeiUpdated', cb: Callback<PricePerTokenInWeiUpdated>): void
    once(event: 'PricePerTokenInWeiUpdated', options: EventOptions, cb: Callback<PricePerTokenInWeiUpdated>): void

    once(event: 'ProjectCurrencyInfoUpdated', cb: Callback<ProjectCurrencyInfoUpdated>): void
    once(event: 'ProjectCurrencyInfoUpdated', options: EventOptions, cb: Callback<ProjectCurrencyInfoUpdated>): void

    once(event: 'PurchaseToDisabledUpdated', cb: Callback<PurchaseToDisabledUpdated>): void
    once(event: 'PurchaseToDisabledUpdated', options: EventOptions, cb: Callback<PurchaseToDisabledUpdated>): void
}
