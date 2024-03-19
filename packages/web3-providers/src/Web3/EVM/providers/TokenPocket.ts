import { injectedTokenPocketProvider } from '@masknet/injected-script'
import { isEthereumInjected, isInPageEthereumInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isEthereumInjected('tokenpocket')) return Reflect.get(window, 'tokenpocket')
    if (isInPageEthereumInjected()) return injectedTokenPocketProvider
    // Not available on extension site.
    return injectedTokenPocketProvider
}

export class TokenPocketProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.TokenPocket, getInjectedProvider())
    }

    override get ready() {
        if (isEthereumInjected('tokenpocket')) return true
        if (isInPageEthereumInjected()) return super.ready
        return false
    }

    override get readyPromise() {
        if (isEthereumInjected('tokenpocket')) return Promise.resolve()
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }
}
