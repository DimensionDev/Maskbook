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

export interface AaveProtocolDataProvider extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): AaveProtocolDataProvider
    clone(): AaveProtocolDataProvider
    methods: {
        ADDRESSES_PROVIDER(): NonPayableTransactionObject<string>

        getAllATokens(): NonPayableTransactionObject<[string, string][]>

        getAllReservesTokens(): NonPayableTransactionObject<[string, string][]>

        getReserveConfigurationData(asset: string): NonPayableTransactionObject<{
            decimals: string
            ltv: string
            liquidationThreshold: string
            liquidationBonus: string
            reserveFactor: string
            usageAsCollateralEnabled: boolean
            borrowingEnabled: boolean
            stableBorrowRateEnabled: boolean
            isActive: boolean
            isFrozen: boolean
            0: string
            1: string
            2: string
            3: string
            4: string
            5: boolean
            6: boolean
            7: boolean
            8: boolean
            9: boolean
        }>

        getReserveData(asset: string): NonPayableTransactionObject<{
            availableLiquidity: string
            totalStableDebt: string
            totalVariableDebt: string
            liquidityRate: string
            variableBorrowRate: string
            stableBorrowRate: string
            averageStableBorrowRate: string
            liquidityIndex: string
            variableBorrowIndex: string
            lastUpdateTimestamp: string
            0: string
            1: string
            2: string
            3: string
            4: string
            5: string
            6: string
            7: string
            8: string
            9: string
        }>

        getReserveTokensAddresses(asset: string): NonPayableTransactionObject<{
            aTokenAddress: string
            stableDebtTokenAddress: string
            variableDebtTokenAddress: string
            0: string
            1: string
            2: string
        }>

        getUserReserveData(
            asset: string,
            user: string,
        ): NonPayableTransactionObject<{
            currentATokenBalance: string
            currentStableDebt: string
            currentVariableDebt: string
            principalStableDebt: string
            scaledVariableDebt: string
            stableBorrowRate: string
            liquidityRate: string
            stableRateLastUpdated: string
            usageAsCollateralEnabled: boolean
            0: string
            1: string
            2: string
            3: string
            4: string
            5: string
            6: string
            7: string
            8: boolean
        }>
    }
    events: {
        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }
}
