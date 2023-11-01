import { isInPageEthereumInjected, isEthereumInjected } from '@masknet/shared-base'
import { wagmiMetaMaskProvider } from '@masknet/injected-script'
import createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'
import { type ChainId, ProviderType, type Web3, type Web3Provider } from '@masknet/web3-shared-evm'
import { BaseWagmiProvider } from './BaseWagmi.js'
import type { WalletAPI } from '../../../entry-types.js'

function getInjectedProvider() {
    if (isEthereumInjected()) return Reflect.get(window, 'ethereum')
    if (isInPageEthereumInjected()) return wagmiMetaMaskProvider
    return createMetaMaskProvider()
}

export class MetaMaskProvider
    extends BaseWagmiProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    constructor() {
        super(ProviderType.MetaMask, getInjectedProvider())
    }

    protected override onAccountsChanged(accounts: string[]): void {
        if (accounts.length) this.emitter.emit('accounts', accounts)
        // disconnection will trigger an empty accounts list
        else this.emitter.emit('disconnect', ProviderType.MetaMask)
    }

    override get ready() {
        if (isEthereumInjected()) return true
        if (isInPageEthereumInjected()) return super.ready
        return this.bridge.isConnected
    }

    override get readyPromise() {
        if (isEthereumInjected()) return Promise.resolve()
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }
}
