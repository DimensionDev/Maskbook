import { injectedBitGetProvider } from '@masknet/injected-script'
import { isEthereumInjected, isInPageEthereumInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

function getInjectedProvider() {
    if (isEthereumInjected('bitkeep')) return Reflect.get(window, 'bitkeep')
    if (isInPageEthereumInjected()) return injectedBitGetProvider
    // Not available on extension site.
    return injectedBitGetProvider
}

export class BitGetProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.BitGet, getInjectedProvider())
    }

    override get ready() {
        if (isEthereumInjected('bitkeep')) return true
        if (isInPageEthereumInjected()) return super.ready
        return false
    }

    override get readyPromise() {
        if (isEthereumInjected('bitkeep')) return Promise.resolve()
        if (isInPageEthereumInjected()) return super.readyPromise
        return Promise.resolve()
    }
}
