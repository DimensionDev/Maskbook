import { useAsyncRetry } from 'react-use'
import type { ProviderType } from '@masknet/web3-shared-evm'
import { Providers } from '../state/Connection/provider'

export function useProviderReady(providerType: ProviderType) {
    return useAsyncRetry(async () => Providers[providerType]?.readyPromise, [providerType])
}
