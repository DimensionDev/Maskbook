import { injectedWalletLinkProvider } from '@masknet/injected-script'
import { type ChainId, ProviderType, type Web3, type Web3Provider } from '@masknet/web3-shared-evm'
import { BaseInjectedProvider } from './BaseInjected.js'
import type { WalletAPI } from '../../../entry-types.js'

export class WalletLinkProvider
    extends BaseInjectedProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    constructor() {
        super(ProviderType.WalletLink, injectedWalletLinkProvider)
    }
}
