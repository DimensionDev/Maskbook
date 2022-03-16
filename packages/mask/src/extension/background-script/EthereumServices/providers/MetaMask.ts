import type { RequestArguments } from 'web3-core'
import { delay } from '@dimensiondev/kit'
import createMetaMaskProvider, { MetaMaskInpageProvider } from '@dimensiondev/metamask-extension-provider'
import { BaseProvider } from './Base'
import type { Provider } from '../types'

export class MetaMaskProvider extends BaseProvider implements Provider {
    private provider: MetaMaskInpageProvider | null = null

    private async createMetaMaskProvider() {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (this.provider && this.provider.chainId !== null) return this.provider

        this.provider = createMetaMaskProvider()

        // wait for building the connection
        await delay(1000)

        if (!this.provider || this.provider.chainId === null) {
            this.provider = null
            throw new Error('Unable to create provider.')
        }

        // @ts-ignore
        this.provider.on('accountsChanged', this.onAccountsChanged.bind(this))

        // @ts-ignore
        this.provider.on('chainChanged', this.onChainChanged.bind(this))

        return this.provider
    }

    override async request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        const provider = await this.createMetaMaskProvider()
        return provider.request(requestArguments) as Promise<T>
    }
}
