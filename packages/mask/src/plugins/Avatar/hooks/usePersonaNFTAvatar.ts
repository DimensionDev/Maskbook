import type { EnhanceableSite } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import addSeconds from 'date-fns/addSeconds'
import { useAsyncRetry } from 'react-use'
import { activatedSocialNetworkUI } from '../../../social-network'
import type { RSS3_KEY_SNS } from '../constants'
import type { AvatarMetaDB, NextIDAvatarMeta } from '../types'
import { getNFTAvatarByUserId } from '../utils'
import { useGetNFTAvatar } from './useGetNFTAvatar'

const cache = new Map<string, [Promise<NextIDAvatarMeta | undefined>, number]>()

type GetNFTAvatar = (
    userId?: string,
    network?: EnhanceableSite,
    snsKey?: RSS3_KEY_SNS,
) => Promise<AvatarMetaDB | undefined>

export function usePersonaNFTAvatar(userId: string, avatarId: string, snsKey: RSS3_KEY_SNS) {
    const [, getNFTAvatar] = useGetNFTAvatar()

    return useAsyncRetry(async () => {
        if (!userId) return
        const key = `${userId}-${activatedSocialNetworkUI.networkIdentifier}`
        let v = cache.get(key)
        if (!v || Date.now() > v[1]) {
            cache.set(key, [
                getNFTAvatarForCache(userId, snsKey, avatarId, getNFTAvatar),
                addSeconds(Date.now(), 60).getTime(),
            ])
        }

        v = cache.get(key)
        return v?.[0]
    }, [userId, getNFTAvatar, avatarId, activatedSocialNetworkUI.networkIdentifier, snsKey])
}

async function getNFTAvatarForCache(userId: string, snsKey: RSS3_KEY_SNS, avatarId: string, fn: GetNFTAvatar) {
    const avatarMetaFromPersona = await getNFTAvatarByUserId(userId, avatarId)
    if (avatarMetaFromPersona) return avatarMetaFromPersona
    const avatarMeta = await fn(userId, activatedSocialNetworkUI.networkIdentifier as EnhanceableSite, snsKey)
    if (!avatarMeta) return
    if (avatarMeta.pluginId === NetworkPluginID.PLUGIN_SOLANA) {
        return { imageUrl: '', nickname: '', ...avatarMeta, address: avatarMeta.tokenId }
    }
    return { imageUrl: '', nickname: '', ...avatarMeta }
}
