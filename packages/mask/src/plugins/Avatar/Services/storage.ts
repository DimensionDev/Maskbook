import type { EnhanceableSite } from '@masknet/shared-base'
import { KeyValue } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { NFT_AVATAR_METADATA_STORAGE } from '../constants'
import { NextIDAvatarMeta, NFT_USAGE } from '../types'
import { setAddress } from './kv'

function getKey(network: EnhanceableSite) {
    return NFT_AVATAR_METADATA_STORAGE + '_' + network
}

function getCacheKey(userId: string, network: EnhanceableSite) {
    return `${network}-${userId}`
}

const cache = new Map<string, Promise<NextIDAvatarMeta | undefined>>()

type AvatarMeta = NextIDAvatarMeta & { sign: string }
const NFTAvatarStorage = (network: EnhanceableSite) => KeyValue.createJSON_Storage<AvatarMeta>(getKey(network))

export async function saveAvatar(
    account: string,
    network: EnhanceableSite,
    avatar: NextIDAvatarMeta,
    sign: string,
    nftUsage: NFT_USAGE,
) {
    await setAddress(network, avatar.userId, avatar.pluginId ?? NetworkPluginID.PLUGIN_EVM, account, nftUsage)
    await NFTAvatarStorage(network).set(
        nftUsage === NFT_USAGE.NFT_BACKGROUND ? `${avatar.userId}_background` : avatar.userId,
        {
            ...avatar,
            sign,
        },
    )

    cache.delete(
        getCacheKey(nftUsage === NFT_USAGE.NFT_BACKGROUND ? `${avatar.userId}_background` : avatar.userId, network),
    )
    return avatar
}

export async function getAvatar(
    userId: string,
    network: EnhanceableSite,
    nftUsage: NFT_USAGE,
): Promise<NextIDAvatarMeta | undefined> {
    let f = cache.get(getCacheKey(nftUsage === NFT_USAGE.NFT_BACKGROUND ? `${userId}_background` : userId, network))
    if (f) return f

    f = _getAvatar(nftUsage === NFT_USAGE.NFT_BACKGROUND ? `${userId}_background` : userId, network)
    cache.set(getCacheKey(nftUsage === NFT_USAGE.NFT_BACKGROUND ? `${userId}_background` : userId, network), f)
    return f
}

async function _getAvatar(userId: string, network: EnhanceableSite): Promise<NextIDAvatarMeta | undefined> {
    const data = await NFTAvatarStorage(network).get(userId)
    if (!data) return
    return data as NextIDAvatarMeta
}
