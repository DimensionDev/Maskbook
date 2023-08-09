import { first } from 'lodash-es'
import { isInPageEthereumInjected } from '@masknet/shared-base'
import type { InjectedProvider } from '@masknet/injected-script'
import {
    type ChainId,
    EthereumMethodType,
    type ProviderType,
    type Web3Provider,
    type Web3,
    type RequestArguments,
} from '@masknet/web3-shared-evm'
import type { Plugin } from '@masknet/plugin-infra/content-script'
import { BaseProvider } from './Base.js'
import type { WalletAPI } from '../../../entry-types.js'

export class BaseInjectedProvider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    constructor(
        protected override providerType: ProviderType,
        protected bridge: InjectedProvider,
    ) {
        super(providerType)
    }

    override get ready() {
        return this.bridge.isReady
    }

    override get readyPromise() {
        if (isInPageEthereumInjected()) return this.bridge.untilAvailable()
        return Promise.reject(new Error('Not available on extension site.'))
    }

    override async setup(context?: Plugin.SNSAdaptor.SNSAdaptorContext | undefined) {
        this.bridge.on('accountsChanged', this.onAccountsChanged.bind(this))
        this.bridge.on('chainChanged', this.onChainChanged.bind(this))
        this.bridge.on('disconnect', this.onDisconnect.bind(this))
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

    override createWeb3Provider(options?: WalletAPI.ProviderOptions<ChainId>) {
        if (!this.bridge) throw new Error('Failed to detect in-page provider.')
        return this.bridge as unknown as Web3Provider
    }

    override async request<T>(
        requestArguments: RequestArguments,
        options?: WalletAPI.ProviderOptions<ChainId>,
    ): Promise<T> {
        const provider = this.createWeb3Provider(options)
        return provider.request(requestArguments)
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
        try {
            await this.readyPromise
            await this.bridge.disconnect()
        } catch {
            return
        }
    }
}
