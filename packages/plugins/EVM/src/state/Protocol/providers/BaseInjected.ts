import { delay } from '@dimensiondev/kit'
import { isExtensionSiteType } from '@masknet/shared-base'
import type { EIP1193Provider } from '@masknet/web3-shared-evm'
import type { RequestArguments } from 'web3-core'
import type { Provider } from '../types'
import { BaseProvider } from './Base'

export class BaseInjectedProvider extends BaseProvider implements Provider {
    protected provider: EIP1193Provider | null = null

    constructor(protected name = 'ethereum') {
        super()
    }

    override get isReady() {
        return !!Reflect.has(window, this.name)
    }

    override async untilReady() {
        if (isExtensionSiteType()) return Promise.reject(new Error('No avaiable on extension site.'))

        return new Promise<void>(async (resolve, reject) => {
            let i = 60 // wait for 60 iteration, total 60s

            while (i > 0) {
                i -= 1
                if (this.isReady) {
                    resolve()
                    break
                }
                await delay(1000)
            }
            reject('Failed to detect in-page provider instance.')
        })
    }

    protected createEIP1193Provider() {
        if (this.provider) return this.provider
        if (isExtensionSiteType()) return null

        this.provider = Reflect.get(window, this.name) as EIP1193Provider
        this.provider.on('accountsChanged', this.onAccountsChanged.bind(this))
        this.provider.on('chainChanged', this.onChainChanged.bind(this))
        return this.provider
    }

    override async request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        const provider = await this.createEIP1193Provider()
        if (!provider) throw new Error('No connection.')
        return provider.request(requestArguments) as Promise<T>
    }

    protected onAccountsChanged(accounts: string[]) {
        this.emitter.emit('accounts', accounts)
    }

    protected onChainChanged(chainId: string) {
        this.emitter.emit('chainId', chainId)
    }
}
