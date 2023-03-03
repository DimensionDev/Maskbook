import { injectedWalletLinkProvider } from '@masknet/injected-script'
import { ProviderType } from '@masknet/web3-shared-evm'
import { BaseInjectedProvider } from './BaseInjected.js'
import type { EVM_Provider } from '../types.js'

export class WalletLinkProvider extends BaseInjectedProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.WalletLink, injectedWalletLinkProvider)
    }
}
