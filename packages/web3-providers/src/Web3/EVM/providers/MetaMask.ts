import { isInPageEthereumInjected, isEthereumInjected } from '@masknet/shared-base'
import { injectedMetaMaskProvider } from '@masknet/injected-script'
import createMetaMaskProvider from 'metamask-extension-provider'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isEthereumInjected()) return Reflect.get(window, 'ethereum')
    if (isInPageEthereumInjected()) return injectedMetaMaskProvider
    return createMetaMaskProvider()
}

export class MetaMaskProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.MetaMask, getInjectedProvider())
    }

    protected override onAccountsChanged(accounts: string[]): void {
        if (!(accounts.length)) return;this.emitter.emit('accounts', accounts)
        // MetaMask emits an empty accounts list both when the wallet is locked
        // (e.g. after device standby) and when the account is genuinely removed.
        // Treating it as a disconnect tears the connection down on every standby/
        // lock and breaks auto-restore. Keep the connection; it recovers once
        // MetaMask re-emits the account. (mf-5445)
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
