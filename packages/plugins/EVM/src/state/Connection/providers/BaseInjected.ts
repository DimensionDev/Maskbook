import { first } from 'lodash-unified'
import type { RequestArguments } from 'web3-core'
import { isExtensionSiteType } from '@masknet/shared-base'
import type { InjectedProvider } from '@masknet/injected-script/sdk/Base'
import { ChainId, EthereumMethodType, ProviderType, Web3Provider } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types'
import { BaseProvider } from './Base'

export class BaseInjectedProvider extends BaseProvider implements EVM_Provider {
    constructor(protected providerType: ProviderType, protected bridge: InjectedProvider) {
        super()

        bridge.on('accountsChanged', this.onAccountsChanged.bind(this))
        bridge.on('chainChanged', this.onChainChanged.bind(this))
        bridge.on('disconnect', this.onDisconnect.bind(this))
    }

    override get ready() {
        return this.bridge.isReady
    }

    override get readyPromise() {
        if (isExtensionSiteType()) return Promise.reject(new Error('Not avaiable on extension site.'))
        return this.bridge.untilAvailable().then(() => undefined)
    }

    protected onAccountsChanged(accounts: string[]) {
        this.emitter.emit('accounts', accounts)
    }

    protected onChainChanged(chainId: string) {
        this.emitter.emit('chainId', chainId)
    }

    protected onDisconnect() {
        this.emitter.emit('disconnect', this.providerType)
    }

    override async createWeb3Provider(chainId?: ChainId) {
        await this.readyPromise

        if (!this.bridge) throw new Error('Failed to detect in-page provider.')
        return this.bridge as unknown as Web3Provider
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
            params: [],
        })
        const chainId = await provider.request<string>({
            method: EthereumMethodType.ETH_CHAIN_ID,
            params: [],
        })

        return {
            chainId: Number.parseInt(chainId, 16),
            account: first(accounts) ?? '',
        }
    }

    override async disconnect() {
        await this.readyPromise
        await this.bridge.disconnect()
    }
}
