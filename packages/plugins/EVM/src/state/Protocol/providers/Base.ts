import Web3 from 'web3'
import type { RequestArguments } from 'web3-core'
import { Emitter } from '@servie/events'
import { ChainId, createExternalProvider } from '@masknet/web3-shared-evm'
import type { Provider, ProviderEvents } from '../types'

export class BaseProvider implements Provider {
    // To prevent creating many times, we cache the web3 instance.
    private web3: Web3 | null = null

    // A bridge for runtime provider events.
    emitter = new Emitter<ProviderEvents>()

    /** No need to wait by default */
    get isReady() {
        return true
    }

    /** No need to wait by default */
    untilReady() {
        return Promise.resolve()
    }

    // A provider should at least implement a RPC request method.
    // Then it can be used to create an external provider for web3js.
    async request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        throw new Error('Method not implemented.')
    }

    // Create a web3 instance from external provider by default.
    createWeb3(chainId?: ChainId) {
        if (this.web3) return this.web3
        const provider = this.createExternalProvider(chainId)
        this.web3 = new Web3(provider)
        return this.web3
    }

    // Create an external provider from the basic request method.
    createExternalProvider(chainId?: ChainId) {
        const provider = createExternalProvider(this.request.bind(this))
        if (!provider.request) throw new Error('Failed to create provider.')
        return provider
    }

    connect(chainId: ChainId): Promise<{ chainId: ChainId; account: string }> {
        throw new Error('Method not implemented')
    }

    disconnect(): Promise<void> {
        throw new Error('Method not implemented')
    }
}
