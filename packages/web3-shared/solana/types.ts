import type { PublicKey, BlockResponse, Transaction as SolanaTransaction, TransactionResponse } from '@solana/web3.js'

export enum ChainId {
    Mainnet = 101,
    Testnet = 102,
    Devnet = 103,
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
    DISCONNECT = 'connect',
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
export type Transaction = SolanaTransaction
export type TransactionReceipt = never
export type TransactionDetailed = TransactionResponse
export type TransactionSignature = SolanaTransaction
export type TransactionParameter = string
