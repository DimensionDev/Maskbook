import createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'
import { isExtensionSiteType } from '@masknet/shared-base'
import type { EIP1193Provider } from '@masknet/web3-shared-evm'
import type { Provider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class MetaMaskProvider extends BaseInjectedProvider implements Provider {
    override get isReady() {
        return isExtensionSiteType() ? true : super.isReady
    }

    override untilReady() {
        return isExtensionSiteType() ? Promise.resolve() : super.untilReady()
    }

    protected override createEIP1193Provider() {
        if (this.provider) return this.provider

        this.provider = (
            isExtensionSiteType() ? createMetaMaskProvider() : Reflect.get(window, this.name)
        ) as EIP1193Provider
        this.provider.on('accountsChanged', this.onAccountsChanged.bind(this))
        this.provider.on('chainChanged', this.onChainChanged.bind(this))
        return this.provider
    }
}
