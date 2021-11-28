import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginNFTAvatarRPC } from '../messages'

const cache = new Map<string, Promise<string | undefined>>()
export function useUserOwnerAddress(userId: string): AsyncState<string | undefined> {
    return useAsync(async () => {
        if (!userId) return
        let f = cache.get(userId)
        if (!f) {
            f = PluginNFTAvatarRPC.getAddress(userId)
            cache.set(userId, f)
        }
        const address = await f
        return address
    }, [userId, cache])
}
