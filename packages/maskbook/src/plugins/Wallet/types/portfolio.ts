import type { ZerionTransactionDirection } from './zerion'
import type { DebankTransactionDirection } from './debank'

export enum TransactionType {}

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
