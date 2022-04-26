/// <reference path="./env.d.ts" />

import type { CompositeSignature, MutateOptions, TransactionObject } from '@blocto/fcl'

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

export type Web3 = typeof import('@blocto/fcl')
// export type Web3 = never
export type Web3Provider = {}
export type Signature = CompositeSignature[]
export type Transaction = MutateOptions
export type TransactionDetailed = TransactionObject
export type TransactionSignature = never
export type TransactionParameter = string
