import { injectedRainbowProvider } from '@masknet/injected-script'
import { isEthereumInjected, isInPageEthereumInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isEthereumInjected('rainbow')) return Reflect.get(window, 'rainbow')
    if (isInPageEthereumInjected()) return injectedRainbowProvider
    // Not available on extension site.
    return injectedRainbowProvider
}

export class RainbowProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.Rainbow, getInjectedProvider())
    }

    override get ready() {
        if (isEthereumInjected('rainbow')) return true
        if (isInPageEthereumInjected()) return super.ready
        return false
    }

    override get readyPromise() {
        if (isEthereumInjected('rainbow')) return Promise.resolve()
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }
}
