import { injectedCoin98EVMProvider } from '@masknet/injected-script'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types.js'
import { BaseInjectedProvider } from './BaseInjected.js'

export class Coin98Provider extends BaseInjectedProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.Coin98, injectedCoin98EVMProvider)
    }
}
