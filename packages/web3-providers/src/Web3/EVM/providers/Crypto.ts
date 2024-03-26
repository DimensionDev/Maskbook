import { injectedCryptoProvider } from '@masknet/injected-script'
import { isEthereumInjected, isInPageEthereumInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isEthereumInjected('ethereum')) return Reflect.get(window, 'ethereum')
    if (isInPageEthereumInjected()) return injectedCryptoProvider
    // Not available on extension site.
    return injectedCryptoProvider
}

export class CryptoProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.Crypto, getInjectedProvider())
    }

    override get ready() {
        if (isEthereumInjected('ethereum')) return true
        if (isInPageEthereumInjected()) return super.ready
        return false
    }

    override get readyPromise() {
        if (isEthereumInjected('ethereum')) return Promise.resolve()
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }
}
