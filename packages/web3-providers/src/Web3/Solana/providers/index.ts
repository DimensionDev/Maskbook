import { ProviderType, type ChainId } from '@masknet/web3-shared-solana'
import type { VersionedTransaction } from '@solana/web3.js'
import type { WalletAPI } from '../../../entry-types.js'
import { SolanaCoin98Provider } from './Coin98.js'
import { NoneProvider } from './None.js'
import { SolanaPhantomProvider } from './Phantom.js'
import { SolanaSolflareProvider } from './SolflareProvider.js'

export interface SolanaWalletProvider extends WalletAPI.Provider<ChainId, ProviderType> {
    /** Sign message */
    signMessage(message: string): Promise<string>
    /** Verify signature */
    /** Sign a transaction */
    signTransaction(transaction: VersionedTransaction): Promise<VersionedTransaction>
    /** Sign multiple transactions */
    signTransactions(transactions: VersionedTransaction[]): Promise<VersionedTransaction[]>
}

export function createSolanaWalletProviders(): Record<ProviderType, SolanaWalletProvider> {
    return {
        [ProviderType.None]: new NoneProvider(),
        [ProviderType.Phantom]: new SolanaPhantomProvider(),
        [ProviderType.Solflare]: new SolanaSolflareProvider(),
        // [ProviderType.Sollet]: new SolanaSolletProvider(),
        [ProviderType.Coin98]: new SolanaCoin98Provider(),
    }
}
