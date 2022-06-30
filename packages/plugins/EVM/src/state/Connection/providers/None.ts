import type { RequestArguments } from 'web3-core'
import type { ProviderOptions } from '@masknet/web3-shared-base'
import { ChainId, createPayload } from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base'
import type { EVM_Provider } from '../types'
import { SharedContextSettings } from '../../../settings'

export class NoneProvider extends BaseProvider implements EVM_Provider {
    override async request<T extends unknown>(
        requestArguments: RequestArguments,
        options?: ProviderOptions<ChainId>,
    ): Promise<T> {
        const response = await SharedContextSettings.value.send(
            createPayload(0, requestArguments.method, requestArguments.params),
            options,
        )
        return response?.result as T
    }
}
