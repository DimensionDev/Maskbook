import { useAsyncRetry } from 'react-use'
import { PluginCollectiblesRPC } from '../messages'
import type { CollectibleToken } from '../types'

export function useAsset(token?: CollectibleToken) {
    return useAsyncRetry(async () => {
        if (!token) return
        return PluginCollectiblesRPC.getAsset(token.contractAddress, token.tokenId)
    })
}
