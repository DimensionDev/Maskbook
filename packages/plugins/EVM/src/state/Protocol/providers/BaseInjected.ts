import { first } from 'lodash-unified'
import type { RequestArguments } from 'web3-core'
import { delay } from '@dimensiondev/kit'
import { isExtensionSiteType } from '@masknet/shared-base'
import { ChainId, EIP1193Provider, EthereumMethodType } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types'
import { BaseProvider } from './Base'

export class BaseInjectedProvider extends BaseProvider implements EVM_Provider {
    private provider: EIP1193Provider | null = null

    constructor(protected path = ['ethereum']) {
        super()
    }

    // Retrieve the in-page provider instance from the global variable.
    protected get inpageProvider() {
        if (!this.path.length) return null

        let result: unknown = window

        for (const name of this.path) {
            // @ts-ignore
            result = Reflect.has(result, name)
            if (!result) return null
        }
        return result as EIP1193Provider
    }

    override get ready() {
        return !!this.inpageProvider
    }

    override get readyPromise() {
        if (isExtensionSiteType()) return Promise.reject(new Error('Not avaiable on extension site.'))

        return new Promise<void>(async (resolve, reject) => {
            let i = 60 // wait for 60 iteration, total 60s

            while (i > 0) {
                i -= 1
                if (this.ready) {
                    resolve()
                    return
                }
                await delay(1000)
            }
            reject('Failed to detect in-page provider instance.')
        })
    }

    protected onAccountsChanged(accounts: string[]) {
        this.emitter.emit('accounts', accounts)
    }

    protected onChainChanged(chainId: string) {
        this.emitter.emit('chainId', chainId)
    }

    override async createWeb3Provider(chainId?: ChainId) {
        await this.readyPromise

        if (this.provider) return this.provider
        if (!this.inpageProvider) throw new Error('Failed to detect in-page provider.')
        if (isExtensionSiteType()) throw new Error('Not avaiable on extension site.')

        this.provider = this.inpageProvider
        this.provider.on('accountsChanged', this.onAccountsChanged.bind(this))
        this.provider.on('chainChanged', this.onChainChanged.bind(this))
        return this.provider
    }

    override async request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        const provider = await this.createWeb3Provider()
        return provider.request(requestArguments) as Promise<T>
    }

    override async connect() {
        await this.readyPromise

        const provider = await this.createWeb3Provider()
        const accounts = await provider.request<string[]>({
            method: EthereumMethodType.ETH_REQUEST_ACCOUNTS,
        })
        const chainId = await provider.request<string>({
            method: EthereumMethodType.ETH_CHAIN_ID,
        })

        return {
            chainId: Number.parseInt(chainId, 16),
            account: first(accounts) ?? '',
        }
    }

    override async disconnect() {
        // do nothing
    }
}
