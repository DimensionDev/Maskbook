import { first } from 'lodash-es'
import { isInPageEthereumInjected } from '@masknet/shared-base'
import type { InjectedWalletBridge } from '@masknet/injected-script'
import {
    EthereumMethodType,
    type ProviderType,
    type Web3Provider,
    type RequestArguments,
} from '@masknet/web3-shared-evm'
import { BaseEVMWalletProvider } from './Base.js'

export abstract class EVMInjectedWalletProvider extends BaseEVMWalletProvider {
    constructor(
        protected override providerType: ProviderType,
        protected bridge: InjectedWalletBridge,
    ) {
        super(providerType)
    }

    override get ready() {
        return this.bridge.isReady
    }

    get readyPromise() {
        if (isInPageEthereumInjected()) return this.bridge.untilAvailable()
        return Promise.reject(new Error('Not available on extension site.'))
    }

    setup() {
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

    override createWeb3Provider() {
        if (!this.bridge) throw new Error('Failed to detect in-page provider.')
        return this.bridge as unknown as Web3Provider
    }

    override async request(requestArguments: RequestArguments): Promise<unknown> {
        const provider = this.createWeb3Provider()
        return provider.request(requestArguments)
    }

    override async connect() {
        await this.readyPromise

        const provider = this.createWeb3Provider()
        const accounts = (await provider.request({
            method: EthereumMethodType.eth_requestAccounts,
            params: [],
        })) as string[]
        const chainId = (await provider.request({
            method: EthereumMethodType.eth_chainId,
            params: [],
        })) as string
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
