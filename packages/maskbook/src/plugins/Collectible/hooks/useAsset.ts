import { useAsyncRetry } from 'react-use'
import { PluginCollectibleRPC } from '../messages'
import type { CollectibleToken } from '../UI/types'

export function useAsset(token?: CollectibleToken) {
    return useAsyncRetry(async () => {
        if (!token) return
        return PluginCollectibleRPC.getAsset(token.contractAddress, token.tokenId)
    })
}
