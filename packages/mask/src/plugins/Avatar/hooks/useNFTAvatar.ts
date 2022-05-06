import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { activatedSocialNetworkUI } from '../../../social-network'
import { PluginNFTAvatarRPC } from '../messages'
import type { AvatarMetaDB } from '../types'
import type { RSS3_KEY_SNS } from '../constants'

export function useNFTAvatar(userId: string | undefined, snsKey: RSS3_KEY_SNS): AsyncState<AvatarMetaDB | undefined> {
    return useAsync(async () => {
        if (!userId) return
        return PluginNFTAvatarRPC.getNFTAvatar(userId, activatedSocialNetworkUI.networkIdentifier, snsKey)
    }, [userId, activatedSocialNetworkUI.networkIdentifier])
}
