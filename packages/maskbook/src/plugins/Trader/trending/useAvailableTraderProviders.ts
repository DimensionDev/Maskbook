import { useAsync } from 'react-use'
import { PluginTraderRPC } from '../messages'
import type { TagType } from '../types'

export function useAvailableTraderProviders(type: TagType, keyword: string) {
    return useAsync(async () => {
        if (!keyword) return []
        return PluginTraderRPC.getAvailableTraderProviders(type, keyword)
    }, [type, keyword])
}
