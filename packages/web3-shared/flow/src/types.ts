// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./blocto-fcl.d.ts" />
/// <reference types="@masknet/global-types/webpack" />

import type { MutateOptions, BlockObject, TransactionObject, QueryOptions, BlockHeaderObject } from '@blocto/fcl'

export enum ChainId {
    Mainnet = 1,
    Testnet = 2,
    // For any chains not supported yet.
    Invalid = 0,
}

export enum AddressType {
    Default = 1,
}

export enum SchemaType {
    Fungible = 1,
    NonFungible = 2,
}

export enum NetworkType {
    Flow = 'Flow',
}

export enum ProviderType {
    None = 'None',
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
export type Web3Provider = {}
export type Signature = string
export type GasOption = never
export type Block = BlockObject
export type BlockHeader = BlockHeaderObject
export type Operation = never
export type Transaction = MutateOptions
export type TransactionQuery = QueryOptions
export type TransactionReceipt = never
export type TransactionDetailed = TransactionObject
export type TransactionSignature = never
export type TransactionParameter = string
