import { useAsync } from 'react-use'
import { PluginTraderRPC } from '../messages'
import type { TagType } from '../types'
import type { DataProvider } from '@masknet/public-api'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { NetworkPluginID, useChainId } from '@masknet/plugin-infra'

export function useAvailableDataProviders(type?: TagType, keyword?: string): AsyncState<DataProvider[]> {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return useAsync(async () => {
        return PluginTraderRPC.getAvailableDataProviders(type, keyword)
    }, [chainId, type, keyword])
}
