import { useAsyncRetry } from 'react-use'
import { OrderSide } from 'opensea-js/lib/types'
import type { CollectibleToken } from '../UI/types'
import { PluginCollectibleRPC } from '../messages'

export function useOrders(token?: CollectibleToken, side = OrderSide.Buy) {
    return useAsyncRetry(async () => {
        if (!token) return []
        return PluginCollectibleRPC.getOrders(token.contractAddress, token.tokenId, side)
    }, [token])
}
