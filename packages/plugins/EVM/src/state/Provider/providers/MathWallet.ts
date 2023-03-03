import { injectedMathWalletProvider } from '@masknet/injected-script'
import { ProviderType } from '@masknet/web3-shared-evm'
import { BaseInjectedProvider } from './BaseInjected.js'
import type { EVM_Provider } from '../types.js'

export class MathWalletProvider extends BaseInjectedProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.MathWallet, injectedMathWalletProvider)
    }
}
