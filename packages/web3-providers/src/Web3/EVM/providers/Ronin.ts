import { injectedRoninProvider } from '@masknet/injected-script'
import { isEthereumInjected, isInPageEthereumInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isEthereumInjected('ronin')) return Reflect.get(window, 'ronin')
    if (isInPageEthereumInjected()) return injectedRoninProvider
    // Not available on extension site.
    return injectedRoninProvider
}

export class RoninProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.Ronin, getInjectedProvider())
    }

    override get ready() {
        if (isEthereumInjected('ronin')) return true
        if (isInPageEthereumInjected()) return super.ready
        return false
    }

    override get readyPromise() {
        if (isEthereumInjected('ronin')) return Promise.resolve()
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }
}
