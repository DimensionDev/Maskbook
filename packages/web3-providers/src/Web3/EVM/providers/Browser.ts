import { injectedBrowserProvider } from '@masknet/injected-script'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

export class BrowserProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.Browser, injectedBrowserProvider)
    }

    protected override onAccountsChanged(accounts: string[]): void {
        if (accounts.length) this.emitter.emit('accounts', accounts)
        // Same as MetaMask: an empty accounts list fires both on wallet lock (e.g.
        // after device standby) and on a genuine account removal. Treating it as a
        // disconnect tears the connection down on every standby/lock and breaks
        // auto-restore. Keep the connection; it recovers once the wallet re-emits
        // the account. (mf-5445)
    }

    override async disconnect(): Promise<void> {
        // do nothing
    }

    override onDisconnect() {
        // do nothing
    }
}
