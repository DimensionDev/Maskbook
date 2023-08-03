import {
    type ChainId,
    ProviderType,
    type RequestArguments,
    type Web3Provider,
    type Web3,
} from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base.js'
import { RequestReadonlyAPI } from '../apis/RequestReadonlyAPI.js'
import type { WalletAPI } from '../../../entry-types.js'

const Request = new RequestReadonlyAPI()

export class NoneProvider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    constructor() {
        super(ProviderType.None)
    }

    override async request<T>(
        requestArguments: RequestArguments,
        initial?: WalletAPI.ProviderOptions<ChainId>,
    ): Promise<T> {
        return Request.request(requestArguments, initial)
    }
}
