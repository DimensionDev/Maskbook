import { Emitter } from '@servie/events'
import type { Account, ProviderEvents } from '@masknet/web3-shared-base'
import type { ChainId, ProviderType, Web3, Web3Provider } from '@masknet/web3-shared-solana'
import type { SolanaProvider } from '../types'
import type { Transaction } from '@solana/web3.js'

export class BaseProvider implements SolanaProvider {
    web3: Web3 | null = null

    provider: Web3Provider | null = null

    emitter = new Emitter<ProviderEvents<ChainId, ProviderType>>()

    // No need to wait by default
    get ready() {
        return true
    }

    // No need to wait by default
    get readyPromise() {
        return Promise.resolve()
    }

    switchChain(chainId?: ChainId): Promise<void> {
        throw new Error('Method not implemented.')
    }

    signMessage(dataToSign: string): Promise<string> {
        throw new Error('Method not implemented.')
    }
    verifyMessage(dataToVerify: string, signature: string): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    signTransaction(transaction: Transaction): Promise<Transaction> {
        throw new Error('Method not implemented.')
    }
    signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        return Promise.all(transactions.map((x) => this.signTransaction(x)))
    }
    createWeb3(chainId?: ChainId): Promise<Web3> {
        throw new Error('Method not implemented.')
    }
    createWeb3Provider(chainId?: ChainId): Promise<Web3Provider> {
        throw new Error('Method not implemented.')
    }
    connect(chainId: ChainId): Promise<Account<ChainId>> {
        throw new Error('Method not implemented.')
    }
    disconnect(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
