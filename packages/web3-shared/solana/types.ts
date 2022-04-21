import type { PublicKey } from '@solana/web3.js'

export enum ChainId {
    Mainnet = 101,
    Testnet = 102,
    Devnet = 103,
}

export enum NetworkType {
    Solana = 'Solana',
}

export enum ProviderType {
    Phantom = 'Phantom',
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
    SOL_ACCOUNS = 'sol_accounts',
    SOL_REQUEST_ACCOUNTS = 'sol_requestAccounts',
    HAS_WALLET = 'has_wallet',
    SOL_SIGN = 'sol_sign',
    SOL_VERIFY = 'sol_verify',
}

export interface Payload {
    method: string
    params?: any
}

export interface SolProvider {
    on(name: string, callback: () => void): void
    request: <T>(payload: Payload) => Promise<T>
    connect(): Promise<{
        publicKey: PublicKey
    }>
    disconnect(): Promise<void>
}
