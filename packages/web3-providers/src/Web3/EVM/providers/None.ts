import { type ChainId, ProviderType, type RequestArguments } from '@masknet/web3-shared-evm'
import { BaseEVMWalletProvider } from './Base.js'
import { EVMRequestReadonly } from '../apis/RequestReadonlyAPI.js'
import type { WalletAPI } from '../../../entry-types.js'

export class EVMNoneProvider extends BaseEVMWalletProvider {
    constructor() {
        super(ProviderType.None)
    }

    override async request<T>(
        requestArguments: RequestArguments,
        initial?: WalletAPI.ProviderOptions<ChainId>,
    ): Promise<T> {
        return EVMRequestReadonly.request(requestArguments, initial)
    }
}
