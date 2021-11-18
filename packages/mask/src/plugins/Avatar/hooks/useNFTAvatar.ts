import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginNFTAvatarRPC } from '../messages'
import type { AvatarMetaDB } from '../types'

const cache = new Map<string, Promise<AvatarMetaDB | undefined>>()

export function useNFTAvatar(userId: string): AsyncState<AvatarMetaDB | undefined> {
    return useAsync(async () => {
        if (!userId) return
        if (userId === '$unknown') return
        let f = cache.get(userId)
        if (!f) {
            f = PluginNFTAvatarRPC.getNFTAvatar(userId)
            cache.set(userId, f)
        }
        const avatar = await f
        return avatar
    }, [userId, cache])
}
