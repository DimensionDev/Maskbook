import type { ZerionTransactionDirection } from './zerion'
import type { DebankTransactionDirection } from './debank'
import type { CurrencyType, ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'

export type TransactionDirection = ZerionTransactionDirection | DebankTransactionDirection

export interface TransactionPair {
    name: string
    symbol: string
    address: string
    direction: TransactionDirection
    amount: number
}

export type TransactionGasFee = {
    eth: number
    usd: number
}

export interface Transaction {
    type: string | undefined
    id: string
    timeAt: Date
    toAddress: string
    failed: boolean
    pairs: TransactionPair[]
    gasFee: TransactionGasFee | undefined
}

export enum PortfolioProvider {
    ZERION,
    DEBANK,
}

export enum AssetProvider {
    OPENSEAN,
}

export interface AssetDetailed {
    token: EtherTokenDetailed | ERC20TokenDetailed
    /**
     * The chain name of assets
     */
    chain: 'eth' | string
    /**
     * The total balance of token
     */
    balance: string
    /**
     * The estimated price
     */
    price?: {
        [key in CurrencyType]: string
    }
    /**
     * The estimated value
     */
    value?: {
        [key in CurrencyType]: string
    }
    logoURL?: string
}
