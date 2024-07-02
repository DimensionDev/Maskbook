import { isInPageEthereumInjected, isEthereumInjected } from '@masknet/shared-base'
import { injectedMetaMaskProvider } from '@masknet/injected-script'
import createMetaMaskProvider from 'metamask-extension-provider'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isEthereumInjected()) return Reflect.get(window, 'ethereum')
    if (isInPageEthereumInjected()) return injectedMetaMaskProvider
    // Note: ESM & CommonJS interop
    return (createMetaMaskProvider.default || createMetaMaskProvider)()
}

export class MetaMaskProvider extends EVMInjectedWalletProvider {
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
        const isConnected = (this.bridge as ReturnType<typeof getInjectedProvider>).isConnected()
        return isConnected
    }

    override get readyPromise() {
        if (isEthereumInjected()) return Promise.resolve()
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }

    override async disconnect(): Promise<void> {
        // do nothing
    }

    override onDisconnect() {
        // MetaMask will emit disconnect after switching chain id
        // since then, override to stop listening to the disconnect event with MetaMask
    }
}
