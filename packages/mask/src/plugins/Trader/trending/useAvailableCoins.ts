import { useChainId } from '@masknet/plugin-infra/web3'
import type { DataProvider } from '@masknet/public-api'
import { EMPTY_LIST } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginTraderRPC } from '../messages'
import type { Coin, TagType } from '../types'

export function useAvailableCoins(type: TagType, keyword: string, dataProvider: DataProvider): AsyncState<Coin[]> {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    return useAsync(async () => {
        if (!keyword) return EMPTY_LIST
        return PluginTraderRPC.getAvailableCoins(chainId, keyword, type, dataProvider)
    }, [dataProvider, type, keyword, chainId])
}
