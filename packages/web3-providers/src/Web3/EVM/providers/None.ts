import type { RequestArguments } from 'web3-core'
import { type ChainId, PayloadEditor, ProviderType, type Web3Provider, type Web3 } from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base.js'
import type { WalletAPI } from '../../../entry-types.js'

export class NoneProvider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    constructor() {
        super(ProviderType.None)
    }

    override async request<T>(
        requestArguments: RequestArguments,
        options?: WalletAPI.ProviderOptions<ChainId>,
    ): Promise<T> {
        return this.createWeb3Provider(options).request<T>(
            PayloadEditor.fromMethod(requestArguments.method, requestArguments.params).fill(),
        )
    }
}
