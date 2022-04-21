import { useAsyncRetry } from 'react-use'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { activatedSocialNetworkUI } from '../../../social-network'
import type { RSS3_KEY_SNS } from '../constants'
import { PluginNFTAvatarRPC } from '../messages'
import type { NextIDAvatarMeta } from '../types'
import { getNFTAvatarByUserId } from '../utils'

export function usePersonaNFTAvatar(userId: string, snsKey: RSS3_KEY_SNS) {
    const personas = useMyPersonas()
    return useAsyncRetry(async () => {
        const avatarMetaFromPersona = await getNFTAvatarByUserId(userId)
        if (avatarMetaFromPersona) return avatarMetaFromPersona

        const avatarMeta = await PluginNFTAvatarRPC.getNFTAvatar(
            userId,
            activatedSocialNetworkUI.networkIdentifier,
            snsKey,
        )
        if (!avatarMeta) return
        return { ...avatarMeta, nickname: '', imageUrl: '' } as NextIDAvatarMeta
    }, [userId, personas])
}
