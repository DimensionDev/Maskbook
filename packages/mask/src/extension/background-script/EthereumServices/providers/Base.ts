import Web3 from 'web3'
import type { RequestArguments } from 'web3-core'
import { createExternalProvider } from '@masknet/web3-shared-evm'
import type { Provider } from '../types'

export class BaseProvider implements Provider {
    private web3: Web3 | null = null

    // A provider should at least implement a RPC request method.
    // Then it can be used to create an external provider for web3js.
    async request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        throw new Error('Method not implemented.')
    }

    async createExternalProvider() {
        const provider = createExternalProvider(this.request.bind(this))
        if (!provider.request) throw new Error('Failed to create provider.')
        return provider
    }

    async createWeb3() {
        if (this.web3) return this.web3
        const provider = await this.createExternalProvider()
        this.web3 = new Web3(provider)
        return this.web3
    }
}
