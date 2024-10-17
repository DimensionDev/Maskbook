import { Emitter } from '@servie/events'
import { type Account, type Wallet, EMPTY_LIST, createConstantSubscription } from '@masknet/shared-base'
import { ChainId, type ProviderType, type Transaction, type Web3, type Web3Provider } from '@masknet/web3-shared-solana'
import type { WalletAPI } from '../../../entry-types.js'
import type { SolanaWalletProvider } from './index.js'

export abstract class BaseSolanaWalletProvider implements SolanaWalletProvider {
    web3: Web3 | null = null

    provider: Web3Provider | null = null

    emitter = new Emitter<WalletAPI.ProviderEvents<ChainId, ProviderType>>()

    get subscription() {
        return {
            account: createConstantSubscription(''),
            chainId: createConstantSubscription(ChainId.Mainnet),
            wallets: createConstantSubscription<Wallet[]>(EMPTY_LIST),
        }
    }

    get connected() {
        return false
    }

    // No need to wait by default
    get ready() {
        return true
    }
    switchChain(chainId?: ChainId): Promise<void> {
        throw new Error('Method not implemented.')
    }
    abstract signMessage(message: string): Promise<string>
    abstract signTransaction(transaction: Transaction): Promise<Transaction>
    signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        return Promise.all(transactions.map((x) => this.signTransaction(x)))
    }
    connect(chainId: ChainId): Promise<Account<ChainId>> {
        throw new Error('Method not implemented.')
    }
    disconnect(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
