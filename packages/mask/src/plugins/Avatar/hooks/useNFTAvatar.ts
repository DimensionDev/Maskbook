import { useAsync } from 'react-use'
import { PluginNFTAvatarRPC } from '../messages'
import type { AvatarMetaDB } from '../types'

const EXPIRED_TIME = 60 * 1000
const cache = new Map<string, [number, Promise<AvatarMetaDB | undefined>]>()
export function useNFTAvatar(userId: string) {
    return useAsync(async () => {
        if (!userId) return
        if (userId === '$unknown') return
        const c = cache.get(userId)
        let f
        if (c) {
            f = c[1]
            if (!f || Date.now() - c[0] >= EXPIRED_TIME) {
                f = PluginNFTAvatarRPC.getNFTAvatar(userId)
                cache.set(userId, [Date.now(), f])
            }
        } else {
            f = PluginNFTAvatarRPC.getNFTAvatar(userId)
            cache.set(userId, [Date.now(), f])
        }

        const avatar = await f
        return avatar
    }, [userId, cache])
}
