import { injectedCoin98EVMProvider } from '@masknet/injected-script'
import { ProviderType } from '@masknet/web3-shared-evm'
import { EVMInjectedWalletProvider } from './BaseInjected.js'

export class EVM_Coin98Provider extends EVMInjectedWalletProvider {
    constructor() {
        super(ProviderType.Coin98, injectedCoin98EVMProvider)
    }
}
