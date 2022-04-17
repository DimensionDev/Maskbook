import { isExtensionSiteType } from '@masknet/shared-base'
import type { EIP1193Provider } from '@masknet/web3-shared-evm'
import createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'
import type { Provider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class MetaMaskProvider extends BaseInjectedProvider implements Provider {
    protected override get inpageProvider() {
        return isExtensionSiteType() ? (createMetaMaskProvider() as EIP1193Provider) : super.inpageProvider
    }
}
