import Web3 from 'web3'
import type { RequestArguments } from 'web3-core'
import { first } from 'lodash-unified'
import { ChainId, createExternalProvider, ProviderType } from '@masknet/web3-shared-evm'
import type { Provider } from '../types'
import { currentChainIdSettings, currentProviderSettings } from '../../../../plugins/Wallet/settings'
import { WalletRPC } from '../../../../plugins/Wallet/messages'

export class BaseProvider implements Provider {
    private web3: Web3 | null = null

    constructor(protected providerType: ProviderType) {}

    // A provider should at least implement a RPC request method.
    // Then it can be used to create an external provider for web3js.
    async request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        throw new Error('Method not implemented.')
    }

    async createWeb3() {
        if (this.web3) return this.web3
        const provider = await this.createExternalProvider()
        this.web3 = new Web3(provider)
        return this.web3
    }

    async createExternalProvider() {
        const provider = createExternalProvider(this.request.bind(this))
        if (!provider.request) throw new Error('Failed to create provider.')
        return provider
    }

    async onAccountsChanged(accounts: string[]) {
        if (currentProviderSettings.value !== this.providerType) return
        await WalletRPC.updateAccount({
            account: first(accounts),
            providerType: this.providerType,
        })
    }

    async onChainChanged(id: string) {
        if (currentProviderSettings.value !== this.providerType) return

        // learn more: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids and https://chainid.network/
        const chainId = Number.parseInt(id, 16) || ChainId.Mainnet
        if (currentChainIdSettings.value === chainId) return
        await WalletRPC.updateAccount({
            chainId,
        })
    }

    async onDisconnect() {
        if (currentProviderSettings.value !== this.providerType) return
        await WalletRPC.resetAccount()
    }
}
