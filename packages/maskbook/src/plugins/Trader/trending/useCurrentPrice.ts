import { useAsync } from 'react-use'
import { isUndefined } from 'lodash-es'
import { PluginTraderRPC } from '../messages'

export function usePriceStat(coinId: number) {
    return useAsync(async () => {
        if (isUndefined(coinId)) return []
        return PluginTraderRPC.getPrice(coinId)
    }, [coinId])
}
