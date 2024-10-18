import { ProviderType, type ChainId, type Transaction } from '@masknet/web3-shared-solana'
import { NoneProvider } from './None.js'
import type { WalletAPI } from '../../../entry-types.js'

export interface SolanaWalletProvider extends WalletAPI.Provider<ChainId, ProviderType> {
    /** Sign message */
    signMessage(message: string): Promise<string>
    /** Verify signature */
    /** Sign a transaction */
    signTransaction(transaction: Transaction): Promise<Transaction>
    /** Sign multiple transactions */
    signTransactions(transactions: Transaction[]): Promise<Transaction[]>
}

export function createSolanaWalletProviders(): Record<ProviderType, SolanaWalletProvider> {
    return {
        [ProviderType.None]: new NoneProvider(),
    }
}
