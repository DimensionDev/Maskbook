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

export type ActionPaused_string_bool = ContractEventLog<{
    action: string
    pauseState: boolean
    0: string
    1: boolean
}>
export type ActionPaused_address_string_bool = ContractEventLog<{
    vToken: string
    action: string
    pauseState: boolean
    0: string
    1: string
    2: boolean
}>
export type ActionProtocolPaused = ContractEventLog<{
    state: boolean
    0: boolean
}>
export type DistributedBorrowerVenus = ContractEventLog<{
    vToken: string
    borrower: string
    venusDelta: string
    venusBorrowIndex: string
    0: string
    1: string
    2: string
    3: string
}>
export type DistributedSupplierVenus = ContractEventLog<{
    vToken: string
    supplier: string
    venusDelta: string
    venusSupplyIndex: string
    0: string
    1: string
    2: string
    3: string
}>
export type Failure = ContractEventLog<{
    error: string
    info: string
    detail: string
    0: string
    1: string
    2: string
}>
export type MarketEntered = ContractEventLog<{
    vToken: string
    account: string
    0: string
    1: string
}>
export type MarketExited = ContractEventLog<{
    vToken: string
    account: string
    0: string
    1: string
}>
export type MarketListed = ContractEventLog<{
    vToken: string
    0: string
}>
export type MarketVenus = ContractEventLog<{
    vToken: string
    isVenus: boolean
    0: string
    1: boolean
}>
export type NewCloseFactor = ContractEventLog<{
    oldCloseFactorMantissa: string
    newCloseFactorMantissa: string
    0: string
    1: string
}>
export type NewCollateralFactor = ContractEventLog<{
    vToken: string
    oldCollateralFactorMantissa: string
    newCollateralFactorMantissa: string
    0: string
    1: string
    2: string
}>
export type NewLiquidationIncentive = ContractEventLog<{
    oldLiquidationIncentiveMantissa: string
    newLiquidationIncentiveMantissa: string
    0: string
    1: string
}>
export type NewMaxAssets = ContractEventLog<{
    oldMaxAssets: string
    newMaxAssets: string
    0: string
    1: string
}>
export type NewPauseGuardian = ContractEventLog<{
    oldPauseGuardian: string
    newPauseGuardian: string
    0: string
    1: string
}>
export type NewPriceOracle = ContractEventLog<{
    oldPriceOracle: string
    newPriceOracle: string
    0: string
    1: string
}>
export type NewVAIController = ContractEventLog<{
    oldVAIController: string
    newVAIController: string
    0: string
    1: string
}>
export type NewVAIMintRate = ContractEventLog<{
    oldVAIMintRate: string
    newVAIMintRate: string
    0: string
    1: string
}>
export type NewVenusRate = ContractEventLog<{
    oldVenusRate: string
    newVenusRate: string
    0: string
    1: string
}>
export type VenusSpeedUpdated = ContractEventLog<{
    vToken: string
    newSpeed: string
    0: string
    1: string
}>

export interface VenusComptroller extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): VenusComptroller
    clone(): VenusComptroller
    methods: {
        _addVenusMarkets(vTokens: string[]): NonPayableTransactionObject<void>

        _become(unitroller: string): NonPayableTransactionObject<void>

        _borrowGuardianPaused(): NonPayableTransactionObject<boolean>

        _dropVenusMarket(vToken: string): NonPayableTransactionObject<void>

        _mintGuardianPaused(): NonPayableTransactionObject<boolean>

        _setCloseFactor(newCloseFactorMantissa: number | string | BN): NonPayableTransactionObject<string>

        _setCollateralFactor(
            vToken: string,
            newCollateralFactorMantissa: number | string | BN,
        ): NonPayableTransactionObject<string>

        _setLiquidationIncentive(
            newLiquidationIncentiveMantissa: number | string | BN,
        ): NonPayableTransactionObject<string>

        _setMaxAssets(newMaxAssets: number | string | BN): NonPayableTransactionObject<string>

        _setPauseGuardian(newPauseGuardian: string): NonPayableTransactionObject<string>

        _setPriceOracle(newOracle: string): NonPayableTransactionObject<string>

        _setProtocolPaused(state: boolean): NonPayableTransactionObject<boolean>

        _setVAIController(vaiController_: string): NonPayableTransactionObject<string>

        _setVAIMintRate(newVAIMintRate: number | string | BN): NonPayableTransactionObject<string>

        _setVenusRate(venusRate_: number | string | BN): NonPayableTransactionObject<void>

        _supportMarket(vToken: string): NonPayableTransactionObject<string>

        accountAssets(arg0: string, arg1: number | string | BN): NonPayableTransactionObject<string>

        admin(): NonPayableTransactionObject<string>

        allMarkets(arg0: number | string | BN): NonPayableTransactionObject<string>

        borrowAllowed(
            vToken: string,
            borrower: string,
            borrowAmount: number | string | BN,
        ): NonPayableTransactionObject<string>

        borrowGuardianPaused(arg0: string): NonPayableTransactionObject<boolean>

        borrowVerify(
            vToken: string,
            borrower: string,
            borrowAmount: number | string | BN,
        ): NonPayableTransactionObject<void>

        checkMembership(account: string, vToken: string): NonPayableTransactionObject<boolean>

        'claimVenus(address,address[])'(holder: string, vTokens: string[]): NonPayableTransactionObject<void>

        'claimVenus(address)'(holder: string): NonPayableTransactionObject<void>

        'claimVenus(address[],address[],bool,bool)'(
            holders: string[],
            vTokens: string[],
            borrowers: boolean,
            suppliers: boolean,
        ): NonPayableTransactionObject<void>

        closeFactorMantissa(): NonPayableTransactionObject<string>

        comptrollerImplementation(): NonPayableTransactionObject<string>

        enterMarkets(vTokens: string[]): NonPayableTransactionObject<string[]>

        exitMarket(vTokenAddress: string): NonPayableTransactionObject<string>

        getAccountLiquidity(account: string): NonPayableTransactionObject<{
            0: string
            1: string
            2: string
        }>

        getAllMarkets(): NonPayableTransactionObject<string[]>

        getAssetsIn(account: string): NonPayableTransactionObject<string[]>

        getBlockNumber(): NonPayableTransactionObject<string>

        getHypotheticalAccountLiquidity(
            account: string,
            vTokenModify: string,
            redeemTokens: number | string | BN,
            borrowAmount: number | string | BN,
        ): NonPayableTransactionObject<{
            0: string
            1: string
            2: string
        }>

        getMintableVAI(minter: string): NonPayableTransactionObject<{
            0: string
            1: string
        }>

        getVAIMintRate(): NonPayableTransactionObject<string>

        getXVSAddress(): NonPayableTransactionObject<string>

        isComptroller(): NonPayableTransactionObject<boolean>

        liquidateBorrowAllowed(
            vTokenBorrowed: string,
            vTokenCollateral: string,
            liquidator: string,
            borrower: string,
            repayAmount: number | string | BN,
        ): NonPayableTransactionObject<string>

        liquidateBorrowVerify(
            vTokenBorrowed: string,
            vTokenCollateral: string,
            liquidator: string,
            borrower: string,
            actualRepayAmount: number | string | BN,
            seizeTokens: number | string | BN,
        ): NonPayableTransactionObject<void>

        liquidateCalculateSeizeTokens(
            vTokenBorrowed: string,
            vTokenCollateral: string,
            actualRepayAmount: number | string | BN,
        ): NonPayableTransactionObject<{
            0: string
            1: string
        }>

        liquidationIncentiveMantissa(): NonPayableTransactionObject<string>

        markets(arg0: string): NonPayableTransactionObject<{
            isListed: boolean
            collateralFactorMantissa: string
            isVenus: boolean
            0: boolean
            1: string
            2: boolean
        }>

        maxAssets(): NonPayableTransactionObject<string>

        mintAllowed(
            vToken: string,
            minter: string,
            mintAmount: number | string | BN,
        ): NonPayableTransactionObject<string>

        mintGuardianPaused(arg0: string): NonPayableTransactionObject<boolean>

        mintVAI(mintVAIAmount: number | string | BN): NonPayableTransactionObject<string>

        mintVAIGuardianPaused(): NonPayableTransactionObject<boolean>

        mintVerify(
            vToken: string,
            minter: string,
            actualMintAmount: number | string | BN,
            mintTokens: number | string | BN,
        ): NonPayableTransactionObject<void>

        mintedVAIOf(owner: string): NonPayableTransactionObject<string>

        mintedVAIs(arg0: string): NonPayableTransactionObject<string>

        oracle(): NonPayableTransactionObject<string>

        pauseGuardian(): NonPayableTransactionObject<string>

        pendingAdmin(): NonPayableTransactionObject<string>

        pendingComptrollerImplementation(): NonPayableTransactionObject<string>

        protocolPaused(): NonPayableTransactionObject<boolean>

        redeemAllowed(
            vToken: string,
            redeemer: string,
            redeemTokens: number | string | BN,
        ): NonPayableTransactionObject<string>

        redeemVerify(
            vToken: string,
            redeemer: string,
            redeemAmount: number | string | BN,
            redeemTokens: number | string | BN,
        ): NonPayableTransactionObject<void>

        refreshVenusSpeeds(): NonPayableTransactionObject<void>

        repayBorrowAllowed(
            vToken: string,
            payer: string,
            borrower: string,
            repayAmount: number | string | BN,
        ): NonPayableTransactionObject<string>

        repayBorrowVerify(
            vToken: string,
            payer: string,
            borrower: string,
            actualRepayAmount: number | string | BN,
            borrowerIndex: number | string | BN,
        ): NonPayableTransactionObject<void>

        repayVAI(repayVAIAmount: number | string | BN): NonPayableTransactionObject<string>

        repayVAIGuardianPaused(): NonPayableTransactionObject<boolean>

        seizeAllowed(
            vTokenCollateral: string,
            vTokenBorrowed: string,
            liquidator: string,
            borrower: string,
            seizeTokens: number | string | BN,
        ): NonPayableTransactionObject<string>

        seizeGuardianPaused(): NonPayableTransactionObject<boolean>

        seizeVerify(
            vTokenCollateral: string,
            vTokenBorrowed: string,
            liquidator: string,
            borrower: string,
            seizeTokens: number | string | BN,
        ): NonPayableTransactionObject<void>

        setMintedVAIOf(owner: string, amount: number | string | BN): NonPayableTransactionObject<string>

        transferAllowed(
            vToken: string,
            src: string,
            dst: string,
            transferTokens: number | string | BN,
        ): NonPayableTransactionObject<string>

        transferGuardianPaused(): NonPayableTransactionObject<boolean>

        transferVerify(
            vToken: string,
            src: string,
            dst: string,
            transferTokens: number | string | BN,
        ): NonPayableTransactionObject<void>

        vaiController(): NonPayableTransactionObject<string>

        vaiMintRate(): NonPayableTransactionObject<string>

        venusAccrued(arg0: string): NonPayableTransactionObject<string>

        venusBorrowState(arg0: string): NonPayableTransactionObject<{
            index: string
            block: string
            0: string
            1: string
        }>

        venusBorrowerIndex(arg0: string, arg1: string): NonPayableTransactionObject<string>

        venusClaimThreshold(): NonPayableTransactionObject<string>

        venusInitialIndex(): NonPayableTransactionObject<string>

        venusRate(): NonPayableTransactionObject<string>

        venusSpeeds(arg0: string): NonPayableTransactionObject<string>

        venusSupplierIndex(arg0: string, arg1: string): NonPayableTransactionObject<string>

        venusSupplyState(arg0: string): NonPayableTransactionObject<{
            index: string
            block: string
            0: string
            1: string
        }>
    }
    events: {
        'ActionPaused(string,bool)'(cb?: Callback<ActionPaused_string_bool>): EventEmitter
        'ActionPaused(string,bool)'(options?: EventOptions, cb?: Callback<ActionPaused_string_bool>): EventEmitter

        'ActionPaused(address,string,bool)'(cb?: Callback<ActionPaused_address_string_bool>): EventEmitter
        'ActionPaused(address,string,bool)'(
            options?: EventOptions,
            cb?: Callback<ActionPaused_address_string_bool>,
        ): EventEmitter

        ActionProtocolPaused(cb?: Callback<ActionProtocolPaused>): EventEmitter
        ActionProtocolPaused(options?: EventOptions, cb?: Callback<ActionProtocolPaused>): EventEmitter

        DistributedBorrowerVenus(cb?: Callback<DistributedBorrowerVenus>): EventEmitter
        DistributedBorrowerVenus(options?: EventOptions, cb?: Callback<DistributedBorrowerVenus>): EventEmitter

        DistributedSupplierVenus(cb?: Callback<DistributedSupplierVenus>): EventEmitter
        DistributedSupplierVenus(options?: EventOptions, cb?: Callback<DistributedSupplierVenus>): EventEmitter

        Failure(cb?: Callback<Failure>): EventEmitter
        Failure(options?: EventOptions, cb?: Callback<Failure>): EventEmitter

        MarketEntered(cb?: Callback<MarketEntered>): EventEmitter
        MarketEntered(options?: EventOptions, cb?: Callback<MarketEntered>): EventEmitter

        MarketExited(cb?: Callback<MarketExited>): EventEmitter
        MarketExited(options?: EventOptions, cb?: Callback<MarketExited>): EventEmitter

        MarketListed(cb?: Callback<MarketListed>): EventEmitter
        MarketListed(options?: EventOptions, cb?: Callback<MarketListed>): EventEmitter

        MarketVenus(cb?: Callback<MarketVenus>): EventEmitter
        MarketVenus(options?: EventOptions, cb?: Callback<MarketVenus>): EventEmitter

        NewCloseFactor(cb?: Callback<NewCloseFactor>): EventEmitter
        NewCloseFactor(options?: EventOptions, cb?: Callback<NewCloseFactor>): EventEmitter

        NewCollateralFactor(cb?: Callback<NewCollateralFactor>): EventEmitter
        NewCollateralFactor(options?: EventOptions, cb?: Callback<NewCollateralFactor>): EventEmitter

        NewLiquidationIncentive(cb?: Callback<NewLiquidationIncentive>): EventEmitter
        NewLiquidationIncentive(options?: EventOptions, cb?: Callback<NewLiquidationIncentive>): EventEmitter

        NewMaxAssets(cb?: Callback<NewMaxAssets>): EventEmitter
        NewMaxAssets(options?: EventOptions, cb?: Callback<NewMaxAssets>): EventEmitter

        NewPauseGuardian(cb?: Callback<NewPauseGuardian>): EventEmitter
        NewPauseGuardian(options?: EventOptions, cb?: Callback<NewPauseGuardian>): EventEmitter

        NewPriceOracle(cb?: Callback<NewPriceOracle>): EventEmitter
        NewPriceOracle(options?: EventOptions, cb?: Callback<NewPriceOracle>): EventEmitter

        NewVAIController(cb?: Callback<NewVAIController>): EventEmitter
        NewVAIController(options?: EventOptions, cb?: Callback<NewVAIController>): EventEmitter

        NewVAIMintRate(cb?: Callback<NewVAIMintRate>): EventEmitter
        NewVAIMintRate(options?: EventOptions, cb?: Callback<NewVAIMintRate>): EventEmitter

        NewVenusRate(cb?: Callback<NewVenusRate>): EventEmitter
        NewVenusRate(options?: EventOptions, cb?: Callback<NewVenusRate>): EventEmitter

        VenusSpeedUpdated(cb?: Callback<VenusSpeedUpdated>): EventEmitter
        VenusSpeedUpdated(options?: EventOptions, cb?: Callback<VenusSpeedUpdated>): EventEmitter

        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }

    once(event: 'ActionProtocolPaused', cb: Callback<ActionProtocolPaused>): void
    once(event: 'ActionProtocolPaused', options: EventOptions, cb: Callback<ActionProtocolPaused>): void

    once(event: 'DistributedBorrowerVenus', cb: Callback<DistributedBorrowerVenus>): void
    once(event: 'DistributedBorrowerVenus', options: EventOptions, cb: Callback<DistributedBorrowerVenus>): void

    once(event: 'DistributedSupplierVenus', cb: Callback<DistributedSupplierVenus>): void
    once(event: 'DistributedSupplierVenus', options: EventOptions, cb: Callback<DistributedSupplierVenus>): void

    once(event: 'Failure', cb: Callback<Failure>): void
    once(event: 'Failure', options: EventOptions, cb: Callback<Failure>): void

    once(event: 'MarketEntered', cb: Callback<MarketEntered>): void
    once(event: 'MarketEntered', options: EventOptions, cb: Callback<MarketEntered>): void

    once(event: 'MarketExited', cb: Callback<MarketExited>): void
    once(event: 'MarketExited', options: EventOptions, cb: Callback<MarketExited>): void

    once(event: 'MarketListed', cb: Callback<MarketListed>): void
    once(event: 'MarketListed', options: EventOptions, cb: Callback<MarketListed>): void

    once(event: 'MarketVenus', cb: Callback<MarketVenus>): void
    once(event: 'MarketVenus', options: EventOptions, cb: Callback<MarketVenus>): void

    once(event: 'NewCloseFactor', cb: Callback<NewCloseFactor>): void
    once(event: 'NewCloseFactor', options: EventOptions, cb: Callback<NewCloseFactor>): void

    once(event: 'NewCollateralFactor', cb: Callback<NewCollateralFactor>): void
    once(event: 'NewCollateralFactor', options: EventOptions, cb: Callback<NewCollateralFactor>): void

    once(event: 'NewLiquidationIncentive', cb: Callback<NewLiquidationIncentive>): void
    once(event: 'NewLiquidationIncentive', options: EventOptions, cb: Callback<NewLiquidationIncentive>): void

    once(event: 'NewMaxAssets', cb: Callback<NewMaxAssets>): void
    once(event: 'NewMaxAssets', options: EventOptions, cb: Callback<NewMaxAssets>): void

    once(event: 'NewPauseGuardian', cb: Callback<NewPauseGuardian>): void
    once(event: 'NewPauseGuardian', options: EventOptions, cb: Callback<NewPauseGuardian>): void

    once(event: 'NewPriceOracle', cb: Callback<NewPriceOracle>): void
    once(event: 'NewPriceOracle', options: EventOptions, cb: Callback<NewPriceOracle>): void

    once(event: 'NewVAIController', cb: Callback<NewVAIController>): void
    once(event: 'NewVAIController', options: EventOptions, cb: Callback<NewVAIController>): void

    once(event: 'NewVAIMintRate', cb: Callback<NewVAIMintRate>): void
    once(event: 'NewVAIMintRate', options: EventOptions, cb: Callback<NewVAIMintRate>): void

    once(event: 'NewVenusRate', cb: Callback<NewVenusRate>): void
    once(event: 'NewVenusRate', options: EventOptions, cb: Callback<NewVenusRate>): void

    once(event: 'VenusSpeedUpdated', cb: Callback<VenusSpeedUpdated>): void
    once(event: 'VenusSpeedUpdated', options: EventOptions, cb: Callback<VenusSpeedUpdated>): void
}
