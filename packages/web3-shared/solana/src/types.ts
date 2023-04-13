import type {
    PublicKey,
    BlockResponse,
    Transaction as SolanaTransaction,
    TransactionResponse,
    AccountInfo,
} from '@solana/web3.js'
import type {
    Web3UI as Web3UIShared,
    Web3State as Web3StateShared,
    Connection,
    ConnectionOptions,
    Hub,
    HubOptions,
} from '@masknet/web3-shared-base'
import type { PageIndicator } from '@masknet/shared-base'

export enum ChainId {
    Mainnet = 101,
    Testnet = 102,
    Devnet = 103,
    // For any chains not supported yet.
    Invalid = 0,
}

export enum AddressType {
    Default = 1,
    Program = 2,
}

export enum SchemaType {
    Native = 1,
    Fungible = 2,
    NonFungible = 3,
}

export enum NetworkType {
    Solana = 'Solana',
}

export enum ProviderType {
    None = 'None',
    Phantom = 'Phantom',
    Solflare = 'Solflare',
    Sollet = 'Sollet',
    Coin98 = 'Coin98',
}

// Learn more at https://docs.phantom.app/integrating/extension-and-mobile-browser/detecting-the-provider
export enum PhantomMethodType {
    CONNECT = 'connect',
    SIGN_MESSAGE = 'signMessage',
    SIGN_TRANSACTION = 'signTransaction',
    SIGN_TRANSACTIONS = 'signAllTransactions',
    SIGN_AND_SEND_TRANSACTION = 'signAndSendTransaction',
}

// Learn more at https://docs.coin98.com/developer-guide/solana-dapps-integration
export enum Coin98MethodType {
    SOL_ACCOUNTS = 'sol_accounts',
    SOL_REQUEST_ACCOUNTS = 'sol_requestAccounts',
    HAS_WALLET = 'has_wallet',
    SOL_SIGN = 'sol_sign',
    SOL_VERIFY = 'sol_verify',
}

export interface Payload {
    method: string
    params?: unknown
}

export type Web3 = typeof import('@solana/web3.js')
export type Web3Provider = {
    publicKey: PublicKey
    on(name: string, callback: () => void): void
    request(payload: Payload): Promise<unknown>
    connect(): Promise<{
        publicKey: string
    }>
    disconnect(): Promise<void>
}
export type Signature = string
export type GasOption = never
export type Block = BlockResponse
export type Operation = never
export type Transaction = SolanaTransaction
export type TransactionReceipt = never
export type TransactionDetailed = TransactionResponse
export type TransactionSignature = SolanaTransaction
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

export interface Web3Connection
    extends Connection<
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
        Web3Provider
    > {
    getAccountInfo(account: string): Promise<AccountInfo<Buffer> | null>
}

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
