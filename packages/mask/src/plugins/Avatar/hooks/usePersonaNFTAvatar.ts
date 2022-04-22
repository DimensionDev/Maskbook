import { useAsyncRetry } from 'react-use'
import { activatedSocialNetworkUI } from '../../../social-network'
import type { RSS3_KEY_SNS } from '../constants'
import { PluginNFTAvatarRPC } from '../messages'
import type { NextIDAvatarMeta } from '../types'
import { getNFTAvatarByUserId } from '../utils'

export function usePersonaNFTAvatar(userId: string, avatarId: string, snsKey: RSS3_KEY_SNS) {
    return useAsyncRetry(async () => {
        const avatarMetaFromPersona = await getNFTAvatarByUserId(userId)
        if (avatarMetaFromPersona && avatarMetaFromPersona.avatarId === avatarId) return avatarMetaFromPersona

        const avatarMeta = await PluginNFTAvatarRPC.getNFTAvatar(
            userId,
            activatedSocialNetworkUI.networkIdentifier,
            snsKey,
        )

        if (!avatarMeta) return
        const info: NextIDAvatarMeta = {
            ...avatarMeta,
            imageUrl: avatarMeta.imageUrl ?? '',
            nickname: avatarMeta.nickname ?? '',
        }
        return info
    }, [userId])
}
