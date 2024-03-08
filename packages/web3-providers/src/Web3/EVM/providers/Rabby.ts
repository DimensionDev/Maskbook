import { injectedRabbyProvider } from '@masknet/injected-script'
import { isEthereumInjected, isInPageEthereumInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isEthereumInjected('rabby')) return Reflect.get(window, 'rabby')
    if (isInPageEthereumInjected()) return injectedRabbyProvider
    // Not available on extension site.
    return injectedRabbyProvider
}

export class RabbyProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.Rabby, getInjectedProvider())
    }

    override get ready() {
        if (isEthereumInjected('rabby')) return true
        if (isInPageEthereumInjected()) return super.ready
        return false
    }

    override get readyPromise() {
        if (isEthereumInjected('rabby')) return Promise.resolve()
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }
}
