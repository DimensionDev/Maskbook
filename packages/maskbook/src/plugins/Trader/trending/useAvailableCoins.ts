import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginTraderRPC } from '../messages'
import type { Coin, DataProvider, TagType } from '../types'

export function useAvailableCoins(type: TagType, keyword: string, dataProvider: DataProvider): AsyncState<Coin[]> {
    return useAsync(async () => {
        if (!keyword) return []
        return PluginTraderRPC.getAvailableCoins(keyword, type, dataProvider)
    }, [dataProvider, type, keyword])
}
