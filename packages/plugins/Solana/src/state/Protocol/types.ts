import type { default as Web3, AccountInfo, Transaction, TransactionResponse } from '@solana/web3.js'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId, NetworkType, ProviderType, SolProvider } from '@masknet/web3-shared-solana'

export type SolanaWeb3 = typeof Web3

export type SolanaWeb3State = Web3Plugin.ObjectCapabilities.Capabilities<
    ChainId,
    ProviderType,
    NetworkType,
    string,
    Transaction,
    TransactionResponse,
    Transaction,
    SolanaWeb3
>

export interface SolanaProvider extends Web3Plugin.Provider<ChainId, SolProvider, SolanaWeb3> {
    /** Sign message. */
    signMessage(dataToSign: string): Promise<string>
    /** Sign a transaction. */
    signTransaction(transaction: Transaction): Promise<Transaction>
    /** Sign multiple transactions. */
    signTransactions(transactions: Transaction[]): Promise<Transaction[]>
}

export interface SolanaConnection
    extends Web3Plugin.Connection<
        ChainId,
        ProviderType,
        string,
        Transaction,
        TransactionResponse,
        Transaction,
        SolanaWeb3
    > {
    getAccountInfo(account: string): Promise<AccountInfo<Buffer> | null>
}

export type SolanaConnectionOptions = Web3Plugin.ConnectionOptions<ChainId, ProviderType, Transaction>
