import { first } from 'lodash-unified'
import type { RequestArguments } from 'web3-core'
import { isExtensionSiteType } from '@masknet/shared-base'
import type { EthereumProvider } from '@masknet/injected-script'
import { ChainId, EthereumMethodType, Web3Provider } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types'
import { BaseProvider } from './Base'

export class BaseInjectedProvider extends BaseProvider implements EVM_Provider {
    constructor(protected bridge: EthereumProvider) {
        super()
    }

    override get ready() {
        return !!this.bridge
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

    override async createWeb3Provider(chainId?: ChainId) {
        await this.readyPromise

        if (!this.bridge) throw new Error('Failed to detect in-page provider.')

        this.bridge.on('accountsChanged', this.onAccountsChanged.bind(this))
        this.bridge.on('chainChanged', this.onChainChanged.bind(this))
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
