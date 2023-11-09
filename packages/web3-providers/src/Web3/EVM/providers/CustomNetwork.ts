import { ProviderType } from '@masknet/web3-shared-evm'
import { BaseEVMWalletProvider } from './Base.js'

export class EVMCustomNetworkProvider extends BaseEVMWalletProvider {
    constructor() {
        super(ProviderType.CustomNetwork)
    }
}
