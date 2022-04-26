import { isExtensionSiteType } from '@masknet/shared-base'
import type { Web3Provider } from '@masknet/web3-shared-evm'
import createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'
import type { EVM_Provider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class MetaMaskProvider extends BaseInjectedProvider implements EVM_Provider {
    protected override get inpageProvider() {
        return isExtensionSiteType() ? (createMetaMaskProvider() as Web3Provider) : super.inpageProvider
    }
}
