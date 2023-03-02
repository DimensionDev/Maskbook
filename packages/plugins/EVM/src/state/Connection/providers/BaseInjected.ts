import { first } from 'lodash-es'
import type { RequestArguments } from 'web3-core'
import { isEthereumInjected } from '@masknet/shared-base'
import type { InjectedProvider } from '@masknet/injected-script'
import { type ChainId, EthereumMethodType, type ProviderType, type Web3Provider } from '@masknet/web3-shared-evm'
import type { ProviderOptions } from '@masknet/web3-shared-base'
import type { EVM_Provider } from '../types.js'
import { BaseProvider } from './Base.js'

export class BaseInjectedProvider extends BaseProvider implements EVM_Provider {
    constructor(protected override providerType: ProviderType, protected bridge: InjectedProvider) {
        super(providerType)

        bridge.on('accountsChanged', this.onAccountsChanged.bind(this))
        bridge.on('chainChanged', this.onChainChanged.bind(this))
        bridge.on('disconnect', this.onDisconnect.bind(this))
    }

    override get ready() {
        return this.bridge.isReady
    }

    override get readyPromise() {
        if (isEthereumInjected()) return this.bridge.untilAvailable().then(() => undefined)
        return Promise.reject(new Error('Not available on extension site.'))
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

    override createWeb3Provider(options?: ProviderOptions<ChainId>) {
        if (!this.bridge) throw new Error('Failed to detect in-page provider.')
        return this.bridge as unknown as Web3Provider
    }

    override async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        const provider = this.createWeb3Provider(options)
        return provider.request(requestArguments) as Promise<T>
    }

    override async connect() {
        await this.readyPromise

        const provider = this.createWeb3Provider()
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
