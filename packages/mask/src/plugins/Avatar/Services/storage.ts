import { KeyValue } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { NFT_AVATAR_METADATA_STORAGE } from '../constants'
import type { NextIDAvatarMeta } from '../types'
import { setUserAddress } from './bind'

function getKey(network: string) {
    return NFT_AVATAR_METADATA_STORAGE + '_' + network
}
const NFTAvatarStorage = (network: string) => KeyValue.createJSON_Storage(getKey(network))

export async function saveAvatar(account: string, network: string, avatar: NextIDAvatarMeta, sign: string) {
    await setUserAddress(avatar.userId, account, network, avatar.pluginId ?? NetworkPluginID.PLUGIN_EVM, avatar.chainId)
    await NFTAvatarStorage(network).set(avatar.userId, {
        ...avatar,
        sign,
    })
    return avatar
}

export async function getAvatar(userId: string, network: string) {
    return NFTAvatarStorage(network).get<NextIDAvatarMeta>(userId)
}
