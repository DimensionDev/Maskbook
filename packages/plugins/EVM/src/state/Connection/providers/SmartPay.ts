import { ProviderType } from '@masknet/web3-shared-evm'
import { SCWalletProvider } from './SCWallet.js'
import type { EVM_Provider } from '../types.js'

/**
 * PayGasX
 * Learn more: https://github.com/DimensionDev/PayGasX
 */
export class SmartPayProvider extends SCWalletProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.SmartPay)
    }
}
