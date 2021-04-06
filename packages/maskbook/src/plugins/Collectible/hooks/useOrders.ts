import type { CollectibleToken } from '../types'
import { useAsyncRetry } from 'react-use'
import { PluginCollectiblesRPC } from '../messages'
import type { OpenSeaAssetEvent, OpenSeaAssetEventResponse } from '../apis'

export function useOrders(token?: CollectibleToken, cursor?: string) {
    return useAsyncRetry(async () => {
        if (!token)
            return {
                edges: [] as OpenSeaAssetEvent[],
                pageInfo: {
                    hasNextPage: false,
                },
            } as OpenSeaAssetEventResponse
        return PluginCollectiblesRPC.getOrders(token.contractAddress, token.tokenId, cursor)
    }, [token, cursor])
}
