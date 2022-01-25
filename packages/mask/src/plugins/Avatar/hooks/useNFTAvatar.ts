import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { PluginNFTAvatarRPC } from '../messages'
import type { AvatarMetaDB } from '../types'

export function useNFTAvatar(userId: string): AsyncState<AvatarMetaDB | undefined> {
    return useAsync(async () => {
        if (!userId || userId === '$unknown') return
        return PluginNFTAvatarRPC.getNFTAvatar(userId)
    }, [userId])
}
