import { injectedOKXProvider } from '@masknet/injected-script'
import { isEthereumInjected, isInPageEthereumInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isEthereumInjected('okxwallet')) return Reflect.get(window, 'okxwallet')
    if (isInPageEthereumInjected()) return injectedOKXProvider
    // Not available on extension site.
    return injectedOKXProvider
}

export class OKXProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.OKX, getInjectedProvider())
    }

    override get ready() {
        if (isEthereumInjected('okxwallet')) return true
        if (isInPageEthereumInjected()) return super.ready
        return false
    }

    override get readyPromise() {
        if (isEthereumInjected('okxwallet')) return Promise.resolve()
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }
}
