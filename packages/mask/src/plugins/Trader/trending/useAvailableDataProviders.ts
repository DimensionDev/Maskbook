import { useAsync } from 'react-use'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { PluginTraderRPC } from '../messages'
import type { TagType } from '../types'
import type { DataProvider } from '@masknet/public-api'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

export function useAvailableDataProviders(type?: TagType, keyword?: string): AsyncState<DataProvider[]> {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return useAsync(async () => {
        return PluginTraderRPC.getAvailableDataProviders(chainId, type, keyword)
    }, [chainId, type, keyword])
}
