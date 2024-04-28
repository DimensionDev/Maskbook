import { injectedCryptoProvider } from '@masknet/injected-script'
import { isInPageEthereumInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isInPageEthereumInjected()) return injectedCryptoProvider
    // Not available on extension site.
    return injectedCryptoProvider
}

export class CryptoProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.Crypto, getInjectedProvider())
    }

    override get ready() {
        if (isInPageEthereumInjected()) return super.ready
        return false
    }

    override get readyPromise() {
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }
}
