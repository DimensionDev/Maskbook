import { isEthereumInjected } from '@masknet/shared-base'
import { injectedMetaMaskProvider } from '@masknet/injected-script'
import createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'
import { type ChainId, ProviderType, type Web3, type Web3Provider } from '@masknet/web3-shared-evm'
import { BaseInjectedProvider } from './BaseInjected.js'
import type { WalletAPI } from '../../../entry-types.js'

export class MetaMaskProvider
    extends BaseInjectedProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    constructor() {
        super(ProviderType.MetaMask, isEthereumInjected() ? injectedMetaMaskProvider : createMetaMaskProvider())
    }

    override get ready() {
        if (isEthereumInjected()) return super.ready
        return true
    }

    override get readyPromise() {
        if (isEthereumInjected()) return super.readyPromise
        return Promise.resolve(undefined)
    }

    override onDisconnect() {
        // MetaMask will emit disconnect after switching chain id
        // since then, override to stop listening to the disconnect event with MetaMask
    }

    override async disconnect(): Promise<void> {
        // do nothing
    }
}
