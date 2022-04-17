import type { default as Web3, AccountInfo, Transaction, TransactionResponse } from '@solana/web3.js'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId, NetworkType, ProviderType, SolanaProvider } from '@masknet/web3-shared-solana'

export type Web3State = Web3Plugin.ObjectCapabilities.Capabilities<
    ChainId,
    ProviderType,
    NetworkType,
    string,
    Transaction,
    TransactionResponse,
    Transaction,
    typeof Web3
>

export type ConnectionOptions = Web3Plugin.ConnectionOptions<ChainId, ProviderType, Transaction>

export interface Provider extends Web3Plugin.Provider<ChainId, SolanaProvider, typeof Web3> {
    readonly account: string
    /** Sign message. */
    signMessage(dataToSign: string): Promise<string>
    /** Sign a transaction. */
    signTransaction(transaction: Transaction): Promise<Transaction>
    /** Sign multiple transactions. */
    signTransactions(transactions: Transaction[]): Promise<Transaction[]>
}

export interface Connection
    extends Web3Plugin.Connection<
        ChainId,
        ProviderType,
        string,
        Transaction,
        TransactionResponse,
        Transaction,
        typeof Web3
    > {
    getAccountInfo(account: string): Promise<AccountInfo<Buffer> | null>
}
