import { useChainId } from '@masknet/web3-hooks-base'
import type { DataProvider } from '@masknet/public-api'
import { EMPTY_LIST } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginTraderRPC } from '../messages.js'
import type { Coin, TagType } from '../types/index.js'

export function useAvailableCoins(type: TagType, keyword: string, dataProvider: DataProvider): AsyncState<Coin[]> {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsync(async () => {
        if (!keyword) return EMPTY_LIST
        return PluginTraderRPC.getAvailableCoins(chainId, keyword, type, dataProvider)
    }, [dataProvider, type, keyword, chainId])
}
