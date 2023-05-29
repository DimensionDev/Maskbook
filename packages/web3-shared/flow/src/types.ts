/// <reference path="./blocto-fcl.d.ts" />
/// <reference types="@masknet/global-types/webpack" />

import type { MutateOptions, BlockObject, TransactionObject, QueryOptions, BlockHeaderObject } from '@blocto/fcl'
import type { Web3State as Web3StateShared, Web3UI as Web3UIShared } from '@masknet/web3-shared-base'

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

export type Web3UI = Web3UIShared<ChainId, ProviderType, NetworkType>

export type Web3State = Web3StateShared<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction,
    TransactionParameter
>

export type Web3Definition = {
    ChainId: ChainId
    AddressType: AddressType
    SchemaType: SchemaType
    ProviderType: ProviderType
    NetworkType: NetworkType
    Signature: Signature
    GasOption: GasOption
    Block: Block
    Operation: Operation
    Transaction: Transaction
    TransactionReceipt: TransactionReceipt
    TransactionDetailed: TransactionDetailed
    TransactionSignature: TransactionSignature
    TransactionParameter: TransactionParameter
    UserOperation: Operation
    Web3: Web3
    Web3UI: Web3UI
    Web3Provider: Web3Provider
    Web3State: Web3State
}
