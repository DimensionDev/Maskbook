import { ProfileIdentifier } from '@masknet/shared-base'
import { NextIDStorage } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { activatedSocialNetworkUI } from '../../../social-network'
import type { RSS3_KEY_SNS } from '../constants'
import { PluginNFTAvatarRPC } from '../messages'
import type { NextIDAvatarMeta } from '../types'

export function usePersonaNFTAvatar(userId: string, snsKey: RSS3_KEY_SNS) {
    const personas = useMyPersonas()
    return useAsyncRetry(async () => {
        if (!userId || userId === '$unknown') return
        const id = new ProfileIdentifier(activatedSocialNetworkUI.networkIdentifier, userId)
        const _personas = personas.filter((p) => {
            return p.linkedProfiles.get(id)
        })
        const publicHexKey = _personas?.[0]?.publicHexKey
        if (!publicHexKey) return
        const response = await NextIDStorage.get<NextIDAvatarMeta>(publicHexKey)
        if (response.ok) return response.val
        const avatarMeta = await PluginNFTAvatarRPC.getNFTAvatar(
            userId,
            activatedSocialNetworkUI.networkIdentifier,
            snsKey,
        )
        if (!avatarMeta) return
        return { ...avatarMeta, nickname: '', imageUrl: '' } as NextIDAvatarMeta
    }, [userId, personas])
}
