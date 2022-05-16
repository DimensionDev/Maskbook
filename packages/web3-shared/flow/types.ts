/// <reference path="./env.d.ts" />

import type { CompositeSignature, MutateOptions, BlockObject, TransactionObject } from '@blocto/fcl'

export enum ChainId {
    Mainnet = 1,
    Testnet = 2,
}

export enum SchemaType {
    Fungible = 1,
    NonFungile = 2,
}

export enum NetworkType {
    Flow = 'Flow',
}

export enum ProviderType {
    Blocto = 'Blocto',
    Dapper = 'Dapper',
    Ledger = 'Ledger',
}

export enum AssetProviderType {
    Default = 'Default',
}

export enum TransactionStatusCode {
    UNKNOWN = 0,
    /** Transaction Pending - Awaiting Finalization */
    PENDING = 1,
    /** Transaction Finalized - Awaiting Execution */
    FINALIZED = 2,
    /** Transaction Executed - Awaiting Sealing */
    EXECUTED = 3,
    /** Transaction Sealed - Transaction Complete. At this point the transaction * result has been committed to the blockchain. */
    SEALED = 4,
    /** Transaction Expired */
    EXPIRED = 5,
}

export type Web3 = typeof import('@blocto/fcl')
// export type Web3 = never
export type Web3Provider = {}
export type Signature = CompositeSignature[]
export type Block = BlockObject
export type Transaction = MutateOptions
export type TransactionDetailed = TransactionObject
export type TransactionSignature = never
export type TransactionParameter = string
