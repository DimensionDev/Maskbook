import { LRUCache } from 'lru-cache'
import { useAsyncRetry } from 'react-use'
import {
    type EnhanceableSite,
    NetworkPluginID,
    Sniffings,
    getEnhanceableSiteType,
    getSiteType,
} from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Twitter } from '@masknet/web3-providers'
import type { RSS3_KEY_SITE } from '../constants.js'
import type { AvatarMetaDB, NextIDAvatarMeta } from '../types.js'
import { useGetNFTAvatar } from './useGetNFTAvatar.js'
import { getNFTAvatarByUserId } from '../utils/index.js'

const cache = new LRUCache<string, NextIDAvatarMeta>({
    max: 500,
    ttl: 60 * 1000,
})

type GetNFTAvatar = (
    userId?: string,
    network?: EnhanceableSite,
    key?: RSS3_KEY_SITE,
) => Promise<AvatarMetaDB | undefined>

export function usePersonaNFTAvatar(userId: string, avatarId: string, persona: string, siteKey: RSS3_KEY_SITE) {
    const getNFTAvatar = useGetNFTAvatar()

    return useAsyncRetry(async () => {
        if (!userId) return
        const key = `${userId}-${getSiteType()}`
        if (!cache.has(key)) {
            const nftAvatar = await getNFTAvatarForCache(userId, siteKey, avatarId, persona, getNFTAvatar)
            if (nftAvatar) cache.set(key, nftAvatar)
        }
        return cache.get(key)
    }, [userId, persona, siteKey, getNFTAvatar, avatarId])
}

async function getNFTAvatarForCache(
    userId: string,
    key: RSS3_KEY_SITE,
    avatarId: string,
    persona: string,
    fn: GetNFTAvatar,
) {
    const avatarMetaFromPersona = await getNFTAvatarByUserId(userId, avatarId, persona)
    if (avatarMetaFromPersona) return avatarMetaFromPersona
    const siteType = getEnhanceableSiteType()
    if (!siteType) return
    const avatarMeta = await fn(userId, siteType, key)
    if (!avatarMeta) return
    if (avatarId && avatarId !== avatarMeta.avatarId) return
    if (avatarMeta.pluginId === NetworkPluginID.PLUGIN_SOLANA) {
        return { imageUrl: '', nickname: '', ...avatarMeta, address: avatarMeta.tokenId }
    }
    return { imageUrl: '', nickname: '', pluginId: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet, ...avatarMeta }
}

export function useCheckPersonaNFTAvatar(userId: string, avatarId: string, persona: string, siteKey: RSS3_KEY_SITE) {
    const getNFTAvatar = useGetNFTAvatar()

    return useAsyncRetry(async () => {
        if (!userId) return
        const key = `${userId}-${getSiteType()}`
        if (!cache.has(key)) {
            const nftAvatar = await getNFTAvatarForCache(userId, siteKey, avatarId, persona, getNFTAvatar)
            if (nftAvatar) cache.set(key, nftAvatar)
        }
        const metaData = cache.get(key)
        if (!metaData && Sniffings.is_twitter_page) {
            const nft = await Twitter.getUserNftContainer(userId)
            if (nft)
                // is twitter blue
                return {
                    address: nft.address,
                    tokenId: nft.token_id,
                    userId,
                    avatarId,
                    pluginId: NetworkPluginID.PLUGIN_EVM,
                    chainId: ChainId.Mainnet,
                }
        }
        return metaData
    }, [userId, persona, siteKey, getNFTAvatar, avatarId])
}
