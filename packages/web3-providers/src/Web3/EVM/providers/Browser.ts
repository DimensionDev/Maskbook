import { injectedBrowserProvider } from '@masknet/injected-script'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

export class BrowserProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.Browser, injectedBrowserProvider)
    }

    protected override onAccountsChanged(accounts: string[]): void {
        if (accounts.length) this.emitter.emit('accounts', accounts)
        // disconnection will trigger an empty accounts list
        else this.emitter.emit('disconnect', ProviderType.Browser)
    }

    override async disconnect(): Promise<void> {
        // do nothing
    }

    override onDisconnect() {
        // do nothing
    }
}
