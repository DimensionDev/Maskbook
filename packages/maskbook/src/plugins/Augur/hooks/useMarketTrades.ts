import { useAugurConstants } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { PluginAugurRPC } from '../messages'
import type { Market } from '../types'

export function useMarketTrades(market: Market | undefined, fromTimestamp?: number) {
    const { GRAPH_URL } = useAugurConstants()
    return useAsyncRetry(async () => {
        if (!market || !GRAPH_URL) return
        return PluginAugurRPC.fetchMarketTrades(market.address, market.id, GRAPH_URL, fromTimestamp)
    }, [market, fromTimestamp])
}
