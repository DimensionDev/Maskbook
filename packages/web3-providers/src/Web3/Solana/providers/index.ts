import { ProviderType, type ChainId, type Web3, type Web3Provider, type Transaction } from '@masknet/web3-shared-solana'
import { BaseProvider as SolanaBaseProvider } from './Base.js'
import { PhantomProvider } from './Phantom.js'
import { SolflareProvider } from './SolflareProvider.js'
import { SolletProvider } from './Sollet.js'
import { SolanaCoin98Provider } from './Coin98.js'
import type { WalletAPI } from '../../../entry-types.js'

export interface SolanaProvider extends WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3> {
    /** Sign message */
    signMessage(message: string): Promise<string>
    /** Verify signature */
    verifyMessage(message: string, signature: string): Promise<boolean>
    /** Sign a transaction */
    signTransaction(transaction: Transaction): Promise<Transaction>
    /** Sign multiple transactions */
    signTransactions(transactions: Transaction[]): Promise<Transaction[]>
}

export const SolanaProviders: Record<ProviderType, SolanaProvider> = {
    [ProviderType.None]: new SolanaBaseProvider(),
    [ProviderType.Phantom]: new PhantomProvider(),
    [ProviderType.Solflare]: new SolflareProvider(),
    [ProviderType.Sollet]: new SolletProvider(),
    [ProviderType.Coin98]: new SolanaCoin98Provider(),
}
