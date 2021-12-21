import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginNFTAvatarRPC } from '../messages'

const cache = new Map<string, Promise<string | undefined>>()

export function useUserOwnerAddress(userId: string): AsyncState<string | undefined> {
    return useAsync(async () => {
        if (!userId) return
        if (!cache.has(userId)) {
            cache.set(userId, PluginNFTAvatarRPC.getAddress(userId))
        }
        return await cache.get(userId)
    }, [userId])
}
