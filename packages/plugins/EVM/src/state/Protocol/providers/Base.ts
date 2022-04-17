import Web3 from 'web3'
import type { RequestArguments } from 'web3-core'
import { Emitter } from '@servie/events'
import { ChainId, createEIP1193Provider, EIP1193Provider } from '@masknet/web3-shared-evm'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type { Provider } from '../types'

export class BaseProvider implements Provider {
    web3: Web3 | null = null
    provider: EIP1193Provider | null = null
    emitter = new Emitter<Web3Plugin.ProviderEvents<ChainId>>()

    // No need to wait by default
    get ready() {
        return true
    }

    // No need to wait by default
    get readyPromise() {
        return Promise.resolve()
    }

    // A provider should at least implement a RPC request method.
    // Then it can be used to create an external provider for web3js.
    async request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        throw new Error('Method not implemented.')
    }

    // Create a web3 instance from the external provider by default.
    async createWeb3(chainId?: ChainId) {
        if (this.web3) return this.web3

        // @ts-ignore
        this.web3 = new Web3(await this.createWeb3Provider(chainId))
        return this.web3
    }

    // Create an external provider from the basic request method.
    async createWeb3Provider(chainId?: ChainId) {
        await this.readyPromise

        if (this.provider) return this.provider
        this.provider = createEIP1193Provider(this.request.bind(this))
        return this.provider
    }

    connect(chainId: ChainId): Promise<Web3Plugin.Account<ChainId>> {
        throw new Error('Method not implemented')
    }

    disconnect(): Promise<void> {
        throw new Error('Method not implemented')
    }
}
