import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginTraderRPC } from '../messages'
import type { Coin, TagType } from '../types'
import type { DataProvider } from '@masknet/public-api'

export function useAvailableCoins(type: TagType, keyword: string, dataProvider: DataProvider): AsyncState<Coin[]> {
    return useAsync(async () => {
        if (!keyword) return []
        return PluginTraderRPC.getAvailableCoins(keyword, type, dataProvider)
    }, [dataProvider, type, keyword])
}
