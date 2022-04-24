import type * as fcl from '@blocto/fcl'

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

export enum FclProvider {}

export type Web3 = typeof fcl
export type Signature = fcl.CompositeSignature[]
export type Transaction = fcl.MutateOptions
export type TransactionDetailed = fcl.TransactionObject
export type TransactionSignature = never
export type TransactionParameter = string
