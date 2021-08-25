import { useAugurConstants } from '@masknet/web3-shared'
import { useAsyncRetry } from 'react-use'
import { PluginAugurRPC } from '../messages'
import type { Market } from '../types'

export function useMarketTrades(market: Market | undefined, fromTimestamp?: Number) {
    const { GRAPH_URL } = useAugurConstants()
    return useAsyncRetry(async () => {
        if (!market || !GRAPH_URL) return
        return PluginAugurRPC.fetchMarketTrades(market.address, market.id, GRAPH_URL, fromTimestamp)
    }, [market, fromTimestamp])
}
