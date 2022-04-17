import type Web3 from '@solana/web3.js'
import { Emitter } from '@servie/events'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId, SolanaProvider } from '@masknet/web3-shared-solana'
import type { Provider } from '../types'
import type { Transaction } from '@solana/web3.js'

export class BaseProvider implements Provider {
    web3: typeof Web3 | null = null
    provider: SolanaProvider | null = null
    emitter = new Emitter<Web3Plugin.ProviderEvents<ChainId>>()

    // No need to wait by default
    get ready() {
        return true
    }

    // No need to wait by default
    get readyPromise() {
        return Promise.resolve()
    }

    get account() {
        return ''
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
    createWeb3(chainId?: ChainId): Promise<typeof Web3> {
        throw new Error('Method not implemented.')
    }
    createWeb3Provider(chainId?: ChainId): Promise<SolanaProvider> {
        throw new Error('Method not implemented.')
    }
    connect(chainId: ChainId): Promise<Web3Plugin.Account<ChainId>> {
        throw new Error('Method not implemented.')
    }
    disconnect(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
