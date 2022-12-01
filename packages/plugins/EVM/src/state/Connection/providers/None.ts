import type { RequestArguments } from 'web3-core'
import type { ProviderOptions } from '@masknet/web3-shared-base'
import { ChainId, PayloadEditor, ProviderType } from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base.js'
import type { EVM_Provider } from '../types.js'
import { SharedContextSettings } from '../../../settings/index.js'

export class NoneProvider extends BaseProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.None)
    }

    override async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        const response = await SharedContextSettings.value.send(
            PayloadEditor.fromMethod(requestArguments.method, requestArguments.params).fill(),
            options,
        )
        return response?.result as T
    }
}
