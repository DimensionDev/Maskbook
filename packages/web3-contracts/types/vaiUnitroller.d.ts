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

export type Failure = ContractEventLog<{
    error: string
    info: string
    detail: string
    0: string
    1: string
    2: string
}>
export type LiquidateVAI = ContractEventLog<{
    liquidator: string
    borrower: string
    repayAmount: string
    vTokenCollateral: string
    seizeTokens: string
    0: string
    1: string
    2: string
    3: string
    4: string
}>
export type MintFee = ContractEventLog<{
    minter: string
    feeAmount: string
    0: string
    1: string
}>
export type MintVAI = ContractEventLog<{
    minter: string
    mintVAIAmount: string
    0: string
    1: string
}>
export type NewComptroller = ContractEventLog<{
    oldComptroller: string
    newComptroller: string
    0: string
    1: string
}>
export type NewTreasuryAddress = ContractEventLog<{
    oldTreasuryAddress: string
    newTreasuryAddress: string
    0: string
    1: string
}>
export type NewTreasuryGuardian = ContractEventLog<{
    oldTreasuryGuardian: string
    newTreasuryGuardian: string
    0: string
    1: string
}>
export type NewTreasuryPercent = ContractEventLog<{
    oldTreasuryPercent: string
    newTreasuryPercent: string
    0: string
    1: string
}>
export type RepayVAI = ContractEventLog<{
    payer: string
    borrower: string
    repayVAIAmount: string
    0: string
    1: string
    2: string
}>

export interface VaiUnitroller extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): VaiUnitroller
    clone(): VaiUnitroller
    methods: {
        _become(unitroller: string): NonPayableTransactionObject<void>

        _initializeVenusVAIState(blockNumber: number | string | BN): NonPayableTransactionObject<string>

        _setComptroller(comptroller_: string): NonPayableTransactionObject<string>

        _setTreasuryData(
            newTreasuryGuardian: string,
            newTreasuryAddress: string,
            newTreasuryPercent: number | string | BN,
        ): NonPayableTransactionObject<string>

        admin(): NonPayableTransactionObject<string>

        calcDistributeVAIMinterVenus(vaiMinter: string): NonPayableTransactionObject<{
            0: string
            1: string
            2: string
            3: string
        }>

        comptroller(): NonPayableTransactionObject<string>

        getBlockNumber(): NonPayableTransactionObject<string>

        getMintableVAI(minter: string): NonPayableTransactionObject<{
            0: string
            1: string
        }>

        getVAIAddress(): NonPayableTransactionObject<string>

        initialize(): NonPayableTransactionObject<void>

        isVenusVAIInitialized(): NonPayableTransactionObject<boolean>

        liquidateVAI(
            borrower: string,
            repayAmount: number | string | BN,
            vTokenCollateral: string,
        ): NonPayableTransactionObject<{
            0: string
            1: string
        }>

        mintVAI(mintVAIAmount: number | string | BN): NonPayableTransactionObject<string>

        pendingAdmin(): NonPayableTransactionObject<string>

        pendingVAIControllerImplementation(): NonPayableTransactionObject<string>

        repayVAI(repayVAIAmount: number | string | BN): NonPayableTransactionObject<{
            0: string
            1: string
        }>

        treasuryAddress(): NonPayableTransactionObject<string>

        treasuryGuardian(): NonPayableTransactionObject<string>

        treasuryPercent(): NonPayableTransactionObject<string>

        updateVenusVAIMintIndex(): NonPayableTransactionObject<string>

        vaiControllerImplementation(): NonPayableTransactionObject<string>

        venusInitialIndex(): NonPayableTransactionObject<string>

        venusVAIMinterIndex(arg0: string): NonPayableTransactionObject<string>

        venusVAIState(): NonPayableTransactionObject<{
            index: string
            block: string
            0: string
            1: string
        }>
    }
    events: {
        Failure(cb?: Callback<Failure>): EventEmitter
        Failure(options?: EventOptions, cb?: Callback<Failure>): EventEmitter

        LiquidateVAI(cb?: Callback<LiquidateVAI>): EventEmitter
        LiquidateVAI(options?: EventOptions, cb?: Callback<LiquidateVAI>): EventEmitter

        MintFee(cb?: Callback<MintFee>): EventEmitter
        MintFee(options?: EventOptions, cb?: Callback<MintFee>): EventEmitter

        MintVAI(cb?: Callback<MintVAI>): EventEmitter
        MintVAI(options?: EventOptions, cb?: Callback<MintVAI>): EventEmitter

        NewComptroller(cb?: Callback<NewComptroller>): EventEmitter
        NewComptroller(options?: EventOptions, cb?: Callback<NewComptroller>): EventEmitter

        NewTreasuryAddress(cb?: Callback<NewTreasuryAddress>): EventEmitter
        NewTreasuryAddress(options?: EventOptions, cb?: Callback<NewTreasuryAddress>): EventEmitter

        NewTreasuryGuardian(cb?: Callback<NewTreasuryGuardian>): EventEmitter
        NewTreasuryGuardian(options?: EventOptions, cb?: Callback<NewTreasuryGuardian>): EventEmitter

        NewTreasuryPercent(cb?: Callback<NewTreasuryPercent>): EventEmitter
        NewTreasuryPercent(options?: EventOptions, cb?: Callback<NewTreasuryPercent>): EventEmitter

        RepayVAI(cb?: Callback<RepayVAI>): EventEmitter
        RepayVAI(options?: EventOptions, cb?: Callback<RepayVAI>): EventEmitter

        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }

    once(event: 'Failure', cb: Callback<Failure>): void
    once(event: 'Failure', options: EventOptions, cb: Callback<Failure>): void

    once(event: 'LiquidateVAI', cb: Callback<LiquidateVAI>): void
    once(event: 'LiquidateVAI', options: EventOptions, cb: Callback<LiquidateVAI>): void

    once(event: 'MintFee', cb: Callback<MintFee>): void
    once(event: 'MintFee', options: EventOptions, cb: Callback<MintFee>): void

    once(event: 'MintVAI', cb: Callback<MintVAI>): void
    once(event: 'MintVAI', options: EventOptions, cb: Callback<MintVAI>): void

    once(event: 'NewComptroller', cb: Callback<NewComptroller>): void
    once(event: 'NewComptroller', options: EventOptions, cb: Callback<NewComptroller>): void

    once(event: 'NewTreasuryAddress', cb: Callback<NewTreasuryAddress>): void
    once(event: 'NewTreasuryAddress', options: EventOptions, cb: Callback<NewTreasuryAddress>): void

    once(event: 'NewTreasuryGuardian', cb: Callback<NewTreasuryGuardian>): void
    once(event: 'NewTreasuryGuardian', options: EventOptions, cb: Callback<NewTreasuryGuardian>): void

    once(event: 'NewTreasuryPercent', cb: Callback<NewTreasuryPercent>): void
    once(event: 'NewTreasuryPercent', options: EventOptions, cb: Callback<NewTreasuryPercent>): void

    once(event: 'RepayVAI', cb: Callback<RepayVAI>): void
    once(event: 'RepayVAI', options: EventOptions, cb: Callback<RepayVAI>): void
}
