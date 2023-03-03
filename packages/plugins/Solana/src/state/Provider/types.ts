import type { ChainId, ProviderType, Transaction, Web3, Web3Provider } from '@masknet/web3-shared-solana'
import type { WalletProvider } from '@masknet/web3-shared-base'

export interface SolanaProvider extends WalletProvider<ChainId, ProviderType, Web3Provider, Web3> {
    /** Sign message. */
    signMessage(message: string): Promise<string>
    /** Sign a transaction. */
    signTransaction(transaction: Transaction): Promise<Transaction>
    /** Sign multiple transactions. */
    signTransactions(transactions: Transaction[]): Promise<Transaction[]>
}
