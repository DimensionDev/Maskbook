import { useAsyncRetry } from 'react-use'
import { activatedSocialNetworkUI } from '../../../social-network'
import type { RSS3_KEY_SNS } from '../constants'
import { PluginNFTAvatarRPC } from '../messages'
import { getNFTAvatarByUserId } from '../utils'

export function usePersonaNFTAvatar(userId: string, avatarId: string, snsKey: RSS3_KEY_SNS) {
    return useAsyncRetry(async () => {
        const avatarMetaFromPersona = await getNFTAvatarByUserId(userId, avatarId)
        if (avatarMetaFromPersona) return avatarMetaFromPersona

        const avatarMeta = await PluginNFTAvatarRPC.getNFTAvatar(
            userId,
            activatedSocialNetworkUI.networkIdentifier,
            snsKey,
        )

        if (!avatarMeta) return

        return { ...avatarMeta, imageUrl: '', nickname: '' }
    }, [userId])
}
