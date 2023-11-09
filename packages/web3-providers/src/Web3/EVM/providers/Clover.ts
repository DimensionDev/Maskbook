import { injectedCloverProvider } from '@masknet/injected-script'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

export class CloverProvider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.Clover, injectedCloverProvider)
    }
}
