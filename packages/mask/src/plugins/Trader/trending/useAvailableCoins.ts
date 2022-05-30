import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginTraderRPC } from '../messages'
import type { Coin, TagType } from '../types'
import type { DataProvider } from '@masknet/public-api'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useAvailableCoins(type: TagType, keyword: string, dataProvider: DataProvider): AsyncState<Coin[]> {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsync(async () => {
        if (!keyword) return []
        return PluginTraderRPC.getAvailableCoins(chainId, keyword, type, dataProvider)
    }, [dataProvider, type, keyword, chainId])
}
