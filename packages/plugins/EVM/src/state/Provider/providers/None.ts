import type { RequestArguments } from 'web3-core'
import type { ProviderOptions } from '@masknet/web3-shared-base'
import { type ChainId, PayloadEditor, ProviderType } from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base.js'
import type { EVM_Provider } from '../types.js'

export class NoneProvider extends BaseProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.None)
    }

    override async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        return this.createWeb3Provider(options).request<T>(
            PayloadEditor.fromMethod(requestArguments.method, requestArguments.params).fill(),
        )
    }
}
