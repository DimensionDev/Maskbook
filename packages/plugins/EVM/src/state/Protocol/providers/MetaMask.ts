import createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'
import { injectedMetaMaskProvider } from '@masknet/injected-script'
import { isExtensionSiteType } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class MetaMaskProvider extends BaseInjectedProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.MetaMask, isExtensionSiteType() ? createMetaMaskProvider() : injectedMetaMaskProvider)
    }

    override get ready() {
        if (isExtensionSiteType()) return true
        return super.ready
    }

    override get readyPromise() {
        if (isExtensionSiteType()) return Promise.resolve(undefined)
        return super.readyPromise
    }

    override async disconnect(): Promise<void> {
        // do nothing
    }
}
