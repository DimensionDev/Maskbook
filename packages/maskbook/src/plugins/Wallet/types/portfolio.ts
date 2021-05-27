import type { ZerionTransactionDirection } from './zerion'
import type { DebankTransactionDirection } from './debank'
import type { CurrencyType, FungibleTokenDetailed } from '../../../web3/types'

export enum FilterTransactionType {
    ALL = 'all',
    SENT = 'sent',
    RECEIVE = 'receive',
}

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
    transactionType: string
}

export enum PortfolioProvider {
    ZERION,
    DEBANK,
}

export enum CollectibleProvider {
    OPENSEAN,
}

export interface Asset {
    token: FungibleTokenDetailed
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
