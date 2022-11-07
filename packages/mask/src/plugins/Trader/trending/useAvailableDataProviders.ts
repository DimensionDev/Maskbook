import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import type { DataProvider } from '@masknet/public-api'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { PluginTraderRPC } from '../messages.js'
import type { TagType } from '../types/index.js'

export function useAvailableDataProviders(type?: TagType, keyword?: string): AsyncState<DataProvider[]> {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    return useAsync(async () => {
        if (!keyword) return EMPTY_LIST
        return PluginTraderRPC.getAvailableDataProviders(chainId, type, keyword)
    }, [chainId, type, keyword])
}
