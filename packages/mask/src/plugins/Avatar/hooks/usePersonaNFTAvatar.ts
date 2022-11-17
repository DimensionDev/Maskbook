import LRU from 'lru-cache'
import { useAsyncRetry } from 'react-use'
import { EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import type { RSS3_KEY_SNS } from '../constants.js'
import type { AvatarMetaDB, NextIDAvatarMeta } from '../types.js'
import { getNFTAvatarByUserId } from '../utils/index.js'
import { useGetNFTAvatar } from './useGetNFTAvatar.js'

const cache = new LRU<string, NextIDAvatarMeta>({
    max: 500,
    ttl: 60 * 1000,
})

type GetNFTAvatar = (
    userId?: string,
    network?: EnhanceableSite,
    snsKey?: RSS3_KEY_SNS,
) => Promise<AvatarMetaDB | undefined>

export function usePersonaNFTAvatar(userId: string, avatarId: string, persona: string, snsKey: RSS3_KEY_SNS) {
    const getNFTAvatar = useGetNFTAvatar()

    return useAsyncRetry(async () => {
        if (!userId) return
        const key = `${userId}-${activatedSocialNetworkUI.networkIdentifier}`
        if (!cache.has(key)) {
            const nftAvatar = await getNFTAvatarForCache(userId, snsKey, avatarId, persona, getNFTAvatar)
            if (nftAvatar) cache.set(key, nftAvatar)
        }
        return cache.get(key)
    }, [userId, getNFTAvatar, avatarId, activatedSocialNetworkUI.networkIdentifier])
}

async function getNFTAvatarForCache(
    userId: string,
    snsKey: RSS3_KEY_SNS,
    avatarId: string,
    persona: string,
    fn: GetNFTAvatar,
) {
    const avatarMetaFromPersona = await getNFTAvatarByUserId(userId, avatarId, persona)
    if (avatarMetaFromPersona) return avatarMetaFromPersona
    const avatarMeta = await fn(userId, activatedSocialNetworkUI.networkIdentifier as EnhanceableSite, snsKey)
    if (!avatarMeta) return
    console.log('bbbbbb')
    console.log(avatarMeta)
    if (avatarId && avatarId !== avatarMeta.avatarId) return
    if (avatarMeta.pluginId === NetworkPluginID.PLUGIN_SOLANA) {
        return { imageUrl: '', nickname: '', ...avatarMeta, address: avatarMeta.tokenId }
    }
    return { imageUrl: '', nickname: '', ...avatarMeta }
}
