import { ProviderType, type ChainId, type Transaction } from '@masknet/web3-shared-solana'
import type { WalletAPI } from '../../../entry-types.js'
import { NoneProvider } from './None.js'
import { SolanaCoin98Provider } from './Coin98.js'
import { SolanaPhantomProvider } from './Phantom.js'
import { SolanaSolflareProvider } from './SolflareProvider.js'
import { SolanaOKXProvider } from './OKX.js'

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
        [ProviderType.Phantom]: new SolanaPhantomProvider(),
        [ProviderType.Solflare]: new SolanaSolflareProvider(),
        [ProviderType.Coin98]: new SolanaCoin98Provider(),
        [ProviderType.OKX]: new SolanaOKXProvider(),
    }
}
