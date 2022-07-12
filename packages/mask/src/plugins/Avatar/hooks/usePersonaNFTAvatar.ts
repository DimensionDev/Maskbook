import type { EnhanceableSite } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'
import { activatedSocialNetworkUI } from '../../../social-network'
import type { RSS3_KEY_SNS } from '../constants'
import type { AvatarMetaDB, NextIDAvatarMeta } from '../types'
import { getNFTAvatarByUserId } from '../utils'
import { useGetNFTAvatar } from './useGetNFTAvatar'
import LRU from 'lru-cache'

const cache = new LRU<string, Promise<NextIDAvatarMeta | undefined>>({
    max: 500,
    maxAge: 60 * 1000,
})

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
        if (!cache.get(key)) cache.set(key, getNFTAvatarForCache(userId, snsKey, avatarId, getNFTAvatar))
        return cache.get(key)
    }, [
        userId,
        getNFTAvatar,
        avatarId,
        activatedSocialNetworkUI.networkIdentifier,
        snsKey,
        cache,
        getNFTAvatarForCache,
    ])
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
