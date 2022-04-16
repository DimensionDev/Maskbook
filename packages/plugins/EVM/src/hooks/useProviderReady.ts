import type { ProviderType } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { Providers } from '../state/Protocol/provider'

export function useProviderReady(providerType: ProviderType) {
    return useAsyncRetry(async () => {
        return Providers[providerType]?.untilReady()
    }, [providerType])
}
