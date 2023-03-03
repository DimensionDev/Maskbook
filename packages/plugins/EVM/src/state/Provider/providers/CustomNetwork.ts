import { ProviderType } from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base.js'
import type { EVM_Provider } from '../types.js'

export class CustomNetworkProvider extends BaseProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.CustomNetwork)
    }
}
