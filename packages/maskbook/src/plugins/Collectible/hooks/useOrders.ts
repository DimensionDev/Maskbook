import { useAsyncRetry } from 'react-use'
import { Order, OrderSide } from 'opensea-js/lib/types'
import type { CollectibleToken } from '../UI/types'
import { PluginCollectibleRPC } from '../messages'

export function useOrders(token?: CollectibleToken, side = OrderSide.Buy, pageNum = 1) {
    return useAsyncRetry(async () => {
        if (!token)
            return {
                orders: [] as Order[],
                count: 0,
            }
        return PluginCollectibleRPC.getOrders(token.contractAddress, token.tokenId, side, { pageNum, count: 10 })
    }, [token, pageNum])
}
