import { injectedBrowserProvider } from '@masknet/injected-script'
import { type ChainId, ProviderType, type Web3, type Web3Provider } from '@masknet/web3-shared-evm'
import { BaseInjectedProvider } from './BaseInjected.js'
import type { WalletAPI } from '../../../entry-types.js'

export class BrowserProvider
    extends BaseInjectedProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
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
