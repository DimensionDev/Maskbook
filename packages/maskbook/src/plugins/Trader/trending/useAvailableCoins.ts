import { useAsync } from 'react-use'
import { PluginTraderRPC } from '../messages'
import type { DataProvider, TagType } from '../types'

export function useAvailableCoins(type: TagType, keyword: string, dataProvider: DataProvider) {
    return useAsync(async () => {
        if (!keyword) return []
        return PluginTraderRPC.getAvailableCoins(keyword, type, dataProvider)
    }, [dataProvider, type, keyword])
}
