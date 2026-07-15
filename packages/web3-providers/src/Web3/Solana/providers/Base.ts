import type { Account } from '@masknet/shared-base'
import type { ChainId, ProviderType, Transaction, Web3Provider } from '@masknet/web3-shared-solana'
import { Emitter } from '@servie/events'
import type { WalletAPI } from '../../../entry-types.js'
import type { SolanaWalletProvider } from './index.js'

export abstract class BaseSolanaWalletProvider implements SolanaWalletProvider {
    web3: typeof import('@solana/web3.js') | null = null

    provider: Web3Provider | null = null

    emitter = new Emitter<WalletAPI.ProviderEvents<ChainId, ProviderType>>()

    get subscription(): SolanaWalletProvider['subscription'] | undefined {
        return undefined
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style -- this is the abstract class default implementation, will be overridden by the subclass. class fields cannot be overridden.
    get connected() {
        return false
    }

    // No need to wait by default
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style -- this is the abstract class default implementation, will be overridden by the subclass. class fields cannot be overridden.
    get ready() {
        return true
    }
    switchChain(chainId?: ChainId): Promise<void> {
        throw new Error('Method not implemented.')
    }
    abstract signMessage(message: string): Promise<string>
    abstract signTransaction(transaction: Transaction): Promise<Transaction>
    abstract signTransactions(transactions: Transaction[]): Promise<Transaction[]>
    connect(chainId: ChainId): Promise<Account<ChainId>> {
        throw new Error('Method not implemented.')
    }
    disconnect(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
