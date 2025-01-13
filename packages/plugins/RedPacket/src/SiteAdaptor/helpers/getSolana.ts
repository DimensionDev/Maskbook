import type * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'

export interface Solana {
    isConnected: boolean
    publicKey: SolanaWeb3.PublicKey
    connect(): Promise<void>
    signTransaction: <T extends SolanaWeb3.VersionedTransaction>(transaction: T) => Promise<T>
    signAllTransactions: <T extends SolanaWeb3.VersionedTransaction>(transactions: T[]) => Promise<T[]>
    signAndSendTransaction: <T extends SolanaWeb3.VersionedTransaction>(transaction: T) => Promise<string>
}

export async function getSolana() {
    const solana = Reflect.get(window, 'solana') as Solana | undefined
    if (!solana) throw new Error('No solana client found')
    if (!solana.isConnected) await solana.connect()

    return solana
}
