import type { EnhanceableSite } from '@masknet/shared-base'
import { KeyValue } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { NFT_AVATAR_METADATA_STORAGE } from '../constants'
import type { AllNextIDAvatarMeta, SET_NFT_FLAG } from '../types'
import { setAddress } from './kv'

function getKey(network: EnhanceableSite) {
    return NFT_AVATAR_METADATA_STORAGE + '_' + network
}

function getCacheKey(userId: string, network: EnhanceableSite) {
    return `${network}-${userId}`
}

const cache = new Map<string, Promise<AllNextIDAvatarMeta | undefined>>()

type AvatarMeta = AllNextIDAvatarMeta & { sign: string }
const NFTAvatarStorage = (network: EnhanceableSite) => KeyValue.createJSON_Storage<AvatarMeta>(getKey(network))

export async function saveAvatar(
    account: string,
    network: EnhanceableSite,
    avatar: AllNextIDAvatarMeta,
    sign: string,
    flag: SET_NFT_FLAG,
) {
    await setAddress(network, avatar.userId, avatar.pluginId ?? NetworkPluginID.PLUGIN_EVM, account, flag)
    await NFTAvatarStorage(network).set(avatar.userId, {
        ...avatar,
        sign,
    })

    cache.delete(getCacheKey(avatar.userId, network))
    return avatar
}

export async function getAvatar(userId: string, network: EnhanceableSite): Promise<AllNextIDAvatarMeta | undefined> {
    let f = cache.get(getCacheKey(userId, network))
    if (f) return f

    f = _getAvatar(userId, network)
    cache.set(getCacheKey(userId, network), f)
    return f
}

async function _getAvatar(userId: string, network: EnhanceableSite): Promise<AllNextIDAvatarMeta | undefined> {
    const data = await NFTAvatarStorage(network).get(userId)
    if (!data) return
    return data as AllNextIDAvatarMeta
}
