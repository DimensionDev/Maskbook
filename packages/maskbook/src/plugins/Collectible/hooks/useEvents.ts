import { useAsyncRetry } from 'react-use'
import type { CollectibleToken } from '../UI/types'
import { PluginCollectibleRPC } from '../messages'

export function useEvents(token?: CollectibleToken, cursor?: string) {
    return useAsyncRetry(async () => {
        if (!token)
            return {
                edges: [],
                pageInfo: {
                    hasNextPage: false,
                },
            } as UnboxPromise<typeof PluginCollectibleRPC.getEvents>
        return PluginCollectibleRPC.getEvents(token.contractAddress, token.tokenId, cursor)
    }, [token, cursor])
}
