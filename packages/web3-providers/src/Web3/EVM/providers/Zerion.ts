import { injectedZerionProvider } from '@masknet/injected-script'
import { isEthereumInjected, isInPageEthereumInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isEthereumInjected('zerionWallet')) return Reflect.get(window, 'zerionWallet')
    if (isInPageEthereumInjected()) return injectedZerionProvider
    // Not available on extension site.
    return injectedZerionProvider
}

export class ZerionProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.Zerion, getInjectedProvider())
    }

    override get ready() {
        if (isEthereumInjected('zerionWallet')) return true
        if (isInPageEthereumInjected()) return super.ready
        return false
    }

    override get readyPromise() {
        if (isEthereumInjected('zerionWallet')) return Promise.resolve()
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }
}
