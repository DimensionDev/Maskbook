import type { ZerionTransactionDirection } from './zerion'
import type { DebankTransactionDirection } from './debank'

export enum FilterTransactionType {
    ALL = 'all',
    SEND = 'send',
    RECEIVE = 'receive',
}

export type TransactionDirection = ZerionTransactionDirection | DebankTransactionDirection

export interface TransactionPair {
    name: string
    symbol: string
    address: string
    direction: TransactionDirection
    amount: number
    logoURI?: string
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
