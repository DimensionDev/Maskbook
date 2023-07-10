import { isInPageEthereumInjected, isEthereumInjected } from '@masknet/shared-base'
import { injectedMetaMaskProvider } from '@masknet/injected-script'
import createMetaMaskProvider, { type MetaMaskInpageProvider } from '@dimensiondev/metamask-extension-provider'
import { type ChainId, ProviderType, type Web3, type Web3Provider } from '@masknet/web3-shared-evm'
import { BaseInjectedProvider } from './BaseInjected.js'
import type { WalletAPI } from '../../../entry-types.js'

function getInjectedProvider() {
    if (isEthereumInjected()) return Reflect.get(window, 'ethereum')
    if (isInPageEthereumInjected()) return injectedMetaMaskProvider
    return createMetaMaskProvider()
}

export class MetaMaskProvider
    extends BaseInjectedProvider
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
        const isConnected = (this.bridge as unknown as MetaMaskInpageProvider).isConnected()
        return isConnected
    }

    override get readyPromise() {
        if (isEthereumInjected()) return Promise.resolve(undefined)
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve(undefined)
    }

    override async disconnect(): Promise<void> {
        // do nothing
    }

    override onDisconnect() {
        // MetaMask will emit disconnect after switching chain id
        // since then, override to stop listening to the disconnect event with MetaMask
    }
}
