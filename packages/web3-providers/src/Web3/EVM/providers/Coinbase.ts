import { injectedCoinbaseProvider } from '@masknet/injected-script'
import { isEthereumInjected, isInPageEthereumInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isEthereumInjected('coinbaseWalletExtension'))
        return Reflect.get(window, 'coinbaseWalletExtension') as unknown as typeof injectedCoinbaseProvider
    if (isInPageEthereumInjected()) return injectedCoinbaseProvider
    // Not available on extension site.
    return injectedCoinbaseProvider
}

export class CoinbaseProvider extends EVMInjectedWalletProvider {
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
