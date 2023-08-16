import type { Web3UI as Web3UIShared, Web3State as Web3StateShared } from '@masknet/web3-shared-base'

export type ChainIdOptionalRecord<T> = { [k in ChainId]?: T }

// Learn more about ethereum ChainId https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
export enum ChainId {
    Invalid = 0,

    // Mainnet
    Mainnet = 87, // 'W'.charCodeAt(0),
    Testnet = 84, // 'T'.charCodeAt(0),

    // Dogecoin
    Dogecoin = 68, // 'D'.charCodeAt(0),
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
    Dogecoin = 'Dogecoin',
}

export enum ProviderType {
    None = 'None',
}

export interface UTXO {
    /** The transaction hash behind the UTXO */
    hash: string
    /** To identity the UTXO */
    index: number
    /** Script contains basic instructions for the transaction */
    script: string
    /** Address of the sender wallet */
    address: string
    /** Amount in satoshi */
    amount: string
}

export interface BlockHeader {
    hash: string
    /** The number of confirmations, or -1 if the block is not on the main chain */
    confirmations: number
    /** The difficulty at the block was mint */
    difficulty: string
    /** The block version */
    version: number
    /** The merkle root */
    merkleroot: string
    /** The block height */
    height: number
    /** The number of transactions made by the sender prior to this one encoded as hexadecimal */
    nonce: number
    /** The number of transactions in the block */
    nTx: number
    /** The mint timestamp */
    timestamp: number
}

export interface Block extends BlockHeader {
    /** The address of the miner */
    miner: string
    /** a list of transaction hash */
    txs: string[]
}

/**
 * The transaction to be signed and sent to provider.
 */
export interface Transaction {
    hash: string
    /** Address of the sender wallet */
    from: string
    /** Address of the recipient wallet */
    to: string
    /** Address of the change recipient wallet, default to the sender wallet. */
    change?: string
    /** A previously calculated fee in satoshi */
    fee?: string
    /** The total amount to be sent in satoshi  */
    amount: string
}

export interface TransactionDetailed {
    hash: string
    from: string
    to: string
    locktime: number
    block_hash: string
    block_height: number
    timestamp: number
    script_signature: string
    script: string
}

export interface Web3 {
    /** Get the balance of a specified address, which represents the sum of coins in its unspent outputs. */
    getBalance(address: string): Promise<string>
    /** Get a list of unspent outputs (UTXOs) associated with the specified address. */
    getUTXOs(address: string): Promise<UTXO[]>
    /** Get the unique chain id of the blockchain network. */
    getChainId(): Promise<number>
    /** Get the latest block number on the blockchain network. */
    getBlockNumber(): Promise<number>
    /** Get the block information corresponding to the specified block hash. */
    getBlockByHash(hash: string): Promise<Block>
    /** Get the block information corresponding to the specified block height/number. */
    getBlockByNumber(height: number): Promise<Block>
    /** Get transaction information corresponding to the specified transaction hash. */
    getTransactionByHash(hash: string): Promise<TransactionDetailed>
    /** Send a transaction to the blockchain network. */
    sendTransaction(transaction: Transaction): Promise<void>
    /** Sign a transaction and return the signature. */
    signTransaction(transaction: Transaction): Promise<string>
    /** Send a raw transaction (pre-signed) to the blockchain network. */
    sendRawTransaction(signed: string): Promise<string>
}

export interface Web3Provider {
    getWeb3(): Web3
}

export type Signature = string
export type MessageRequest = never
export type MessageResponse = never
export type UserOperation = never
export type TransactionReceipt = never
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
