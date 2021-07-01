import type { ZerionTransactionDirection } from './zerion'
import type { DebankTransactionDirection } from './debank'

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

export { PortfolioProvider, CollectibleProvider } from '@masknet/web3-shared'
export type { Asset } from '@masknet/web3-shared'
