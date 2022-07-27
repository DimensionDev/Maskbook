import createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'
import { injectedMetaMaskProvider } from '@masknet/injected-script'
import { isEthereumInjected } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class MetaMaskProvider extends BaseInjectedProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.MetaMask, isEthereumInjected() ? injectedMetaMaskProvider : createMetaMaskProvider())
    }

    override get ready() {
        if (isEthereumInjected()) return super.ready
        return true
    }

    override get readyPromise() {
        if (isEthereumInjected()) return super.readyPromise
        return Promise.resolve(undefined)
    }

    override onDisconnect() {
        // MetaMask will emit disconnect after switching chain id
        // since then, override to stop listening to the disconnect event with MetaMask
    }

    override async disconnect(): Promise<void> {
        // do nothing
    }
}
