import type { EnhanceableSite } from '@masknet/shared-base'
import { KeyValue } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { NFT_AVATAR_METADATA_STORAGE } from '../constants'
import type { NextIDAvatarMeta } from '../types'
import { setAddress } from './kv'

function getKey(network: EnhanceableSite) {
    return NFT_AVATAR_METADATA_STORAGE + '_' + network
}

type AvatarMeta = NextIDAvatarMeta & { sign: string }
const NFTAvatarStorage = (network: EnhanceableSite) => KeyValue.createJSON_Storage<AvatarMeta>(getKey(network))

export async function saveAvatar(account: string, network: EnhanceableSite, avatar: NextIDAvatarMeta, sign: string) {
    await setAddress(network, avatar.userId, avatar.pluginId ?? NetworkPluginID.PLUGIN_EVM, account)
    await NFTAvatarStorage(network).set(avatar.userId, {
        ...avatar,
        sign,
    })
    return avatar
}

export async function getAvatar(userId: string, network: EnhanceableSite): Promise<NextIDAvatarMeta | undefined> {
    const data = await NFTAvatarStorage(network).get(userId)
    if (!data) return
    return data as NextIDAvatarMeta
}
