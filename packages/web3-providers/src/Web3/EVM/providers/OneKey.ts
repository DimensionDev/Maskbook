import { injectedOneKeyProvider } from '@masknet/injected-script'
import { isEthereumInjected, isInPageEthereumInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isEthereumInjected('$onekey')) return Reflect.get(window, '$onekey')
    if (isInPageEthereumInjected()) return injectedOneKeyProvider
    // Not available on extension site.
    return injectedOneKeyProvider
}

export class OneKeyProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.OneKey, getInjectedProvider())
    }

    override get ready() {
        if (isEthereumInjected('$onekey')) return true
        if (isInPageEthereumInjected()) return super.ready
        return false
    }

    override get readyPromise() {
        if (isEthereumInjected('$onekey')) return Promise.resolve()
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }
}
