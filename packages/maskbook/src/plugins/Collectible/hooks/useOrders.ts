import { useAsyncRetry } from 'react-use'
import { OrderSide } from 'opensea-js/lib/types'
import type { CollectibleToken } from '../types'
import { PluginCollectiblesRPC } from '../messages'

export function useOrders(token?: CollectibleToken, side = OrderSide.Buy) {
    return useAsyncRetry(async () => {
        if (!token) return []
        return PluginCollectiblesRPC.getOrders(token.contractAddress, token.tokenId, side)
    }, [token])
}
