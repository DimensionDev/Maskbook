import { Emitter } from '@servie/events'
import type { Account, ProviderEvents, ProviderOptions } from '@masknet/web3-shared-base'
import type { ChainId, ProviderType, Web3, Web3Provider } from '@masknet/web3-shared-flow'
import type { FlowProvider } from '../types.js'

export class BaseProvider implements FlowProvider {
    emitter = new Emitter<ProviderEvents<ChainId, ProviderType>>()

    // No need to wait by default
    get ready() {
        return true
    }

    // No need to wait by default
    get readyPromise() {
        return Promise.resolve()
    }

    switchAccount(account?: string): Promise<void> {
        throw new Error('Method not implemented.')
    }
    switchChain(chainId?: ChainId): Promise<void> {
        throw new Error('Method not implemented.')
    }
    createWeb3(options?: ProviderOptions<ChainId>): Web3 {
        throw new Error('Method not implemented.')
    }
    createWeb3Provider(options?: ProviderOptions<ChainId>): Web3Provider {
        throw new Error('Method not implemented.')
    }
    connect(chainId?: ChainId): Promise<Account<ChainId>> {
        throw new Error('Method not implemented.')
    }
    disconnect(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
