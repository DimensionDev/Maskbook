import { injectedTrustProvider } from '@masknet/injected-script'
import { isEthereumInjected, isInPageEthereumInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isEthereumInjected('trustwallet')) return Reflect.get(window, 'trustwallet')
    if (isInPageEthereumInjected()) return injectedTrustProvider
    // Not available on extension site.
    return injectedTrustProvider
}

export class TrustProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.Trust, getInjectedProvider())
    }

    override get ready() {
        if (isEthereumInjected('trustwallet')) return true
        if (isInPageEthereumInjected()) return super.ready
        return false
    }

    override get readyPromise() {
        if (isEthereumInjected('trustwallet')) return Promise.resolve()
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }
}
