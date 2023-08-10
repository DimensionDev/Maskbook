import { injectedCoinbaseProvider } from '@masknet/injected-script'
import { isEthereumInjected, isInPageEthereumInjected } from '@masknet/shared-base'
import { type ChainId, ProviderType, type Web3, type Web3Provider } from '@masknet/web3-shared-evm'
import { BaseInjectedProvider } from './BaseInjected.js'
import type { WalletAPI } from '../../../entry-types.js'

function getInjectedProvider() {
    if (isEthereumInjected('coinbaseWalletExtension')) return Reflect.get(window, 'coinbaseWalletExtension')
    if (isInPageEthereumInjected()) return injectedCoinbaseProvider
    // Not available on extension site.
    return injectedCoinbaseProvider
}

export class CoinbaseProvider
    extends BaseInjectedProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    constructor() {
        super(ProviderType.Coinbase, getInjectedProvider())
    }

    override get ready() {
        if (isEthereumInjected('coinbaseWalletExtension')) return true
        if (isInPageEthereumInjected()) return super.ready
        return false
    }

    override get readyPromise() {
        if (isEthereumInjected('coinbaseWalletExtension')) return Promise.resolve()
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }
}
