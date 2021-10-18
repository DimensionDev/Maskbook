import { useAsync } from 'react-use'
import { useChainId } from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../messages'
import type { TagType } from '../types'
import type { DataProvider } from '@masknet/public-api'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

export function useAvailableDataProviders(type?: TagType, keyword?: string): AsyncState<DataProvider[]> {
    const chainId = useChainId()
    return useAsync(async () => {
        return PluginTraderRPC.getAvailableDataProviders(type, keyword)
    }, [chainId, type, keyword])
}
