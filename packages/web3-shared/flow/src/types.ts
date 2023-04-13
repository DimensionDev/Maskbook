/// <reference path="./blocto-fcl.d.ts" />
/// <reference types="@masknet/global-types/webpack" />

import type { MutateOptions, BlockObject, TransactionObject, QueryOptions, BlockHeaderObject } from '@blocto/fcl'
import type { PageIndicator } from '@masknet/shared-base'
import type {
    Web3State as Web3StateShared,
    Web3UI as Web3UIShared,
    Connection,
    ConnectionOptions,
    Hub,
    HubOptions,
} from '@masknet/web3-shared-base'

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
    AddressType,
    SchemaType,
    ProviderType,
    NetworkType,
    Signature,
    GasOption,
    Block,
    Operation,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionSignature,
    TransactionParameter,
    Web3,
    Web3Provider
>

export type Web3Connection = Connection<
    ChainId,
    AddressType,
    SchemaType,
    ProviderType,
    Signature,
    Block,
    Operation,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionSignature,
    Web3,
    Web3Provider,
    Web3ConnectionOptions
>

export type Web3ConnectionOptions = ConnectionOptions<ChainId, ProviderType, Transaction>

export type Web3Hub = Hub<ChainId, SchemaType, GasOption>

export type Web3HubOptions<Indicator = PageIndicator> = HubOptions<ChainId, Indicator>

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
    Web3Connection: Web3Connection
    Web3ConnectionOptions: Web3ConnectionOptions
    Web3Hub: Web3Hub
    Web3HubOptions: Web3HubOptions
}
