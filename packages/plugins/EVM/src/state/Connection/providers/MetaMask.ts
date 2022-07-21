import createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'
import { injectedMetaMaskProvider } from '@masknet/injected-script'
import { isWindowEthereumUnableToInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class MetaMaskProvider extends BaseInjectedProvider implements EVM_Provider {
    constructor() {
        super(
            ProviderType.MetaMask,
            isWindowEthereumUnableToInjected() ? createMetaMaskProvider() : injectedMetaMaskProvider,
        )
    }

    override get ready() {
        if (isWindowEthereumUnableToInjected()) return true
        return super.ready
    }

    override get readyPromise() {
        if (isWindowEthereumUnableToInjected()) return Promise.resolve(undefined)
        return super.readyPromise
    }

    override onDisconnect() {
        // MetaMask will emit disconnect after switching chain id
        // since then, override to stop listening to the disconnect event with MetaMask
    }

    override async disconnect(): Promise<void> {
        // do nothing
    }
}
