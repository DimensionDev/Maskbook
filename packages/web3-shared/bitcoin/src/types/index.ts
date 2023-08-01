import type { Web3UI as Web3UIShared, Web3State as Web3StateShared } from '@masknet/web3-shared-base'

export type ChainIdOptionalRecord<T> = { [k in ChainId]?: T }

// Learn more about ethereum ChainId https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
export enum ChainId {
    Invalid = 0,

    // Mainnet
    Mainnet = 87, // 'W'.charCodeAt(0),
    Testnet = 84, // 'T'.charCodeAt(0),
    Stagenet = 83, // 'S'.charCodeAt(0),

    BitcoinCash = 66, // 'B'.charCodeAt(0),

    DogoCoin = 68, // 'D'.charCodeAt(0),
}

export enum AddressType {
    ExternalOwned = 1,
}

export enum SchemaType {
    Native = 1,
    BRC20 = 2,
}

export type GasConfig = never

export type GasOption = never

export enum TransactionEventType {
    TRANSACTION_HASH = 'transactionHash',
    RECEIPT = 'receipt',
    CONFIRMATION = 'confirmation',
    ERROR = 'error',
}

export enum NetworkType {
    Mainnet = 'Mainnet',
    Testnet = 'Testnet',
    Stagenet = 'Stagenet',
    DogoCoin = 'DogoCoin',
    BitcoinCash = 'BitcoinCash',
}

export enum ProviderType {
    None = 'None',
}

export type Web3 = never

export type Web3Provider = never

export type Signature = string

export interface Block {
    hash: string
    nonce: string
    timestamp: string
    baseFeePerGas?: number
}

export type MessageRequest = never
export type MessageResponse = never

export interface Transaction {}

export type UserOperation = never
export type TransactionReceipt = never
export type TransactionDetailed = never
export type TransactionSignature = string
export type TransactionParameter = string | boolean | undefined
export type TransactionOptions = never

export type Web3UI = Web3UIShared<ChainId, ProviderType, NetworkType>

export type Web3State = Web3StateShared<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
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
    MessageRequest: MessageRequest
    MessageResponse: MessageResponse
    Operation: UserOperation
    Transaction: Transaction
    TransactionReceipt: TransactionReceipt
    TransactionDetailed: TransactionDetailed
    TransactionSignature: TransactionSignature
    TransactionParameter: TransactionParameter
    UserOperation: UserOperation
    Web3: Web3
    Web3UI: Web3UI
    Web3Provider: Web3Provider
    Web3State: Web3State
}
