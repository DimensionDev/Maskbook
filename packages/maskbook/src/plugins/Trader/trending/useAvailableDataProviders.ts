import { useAsync } from 'react-use'
import { PluginTraderRPC } from '../messages'
import type { TagType } from '../types'

export function useAvailableDataProviders(type: TagType, keyword: string) {
    return useAsync(async () => {
        if (!keyword) return []
        return PluginTraderRPC.getAvailableDataProviders(type, keyword)
    }, [type, keyword])
}
