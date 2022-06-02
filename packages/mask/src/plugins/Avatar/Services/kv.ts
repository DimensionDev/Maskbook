import { KeyValue } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { NFT_AVATAR_METADATA_STORAGE } from '../constants'
import type { NextIDAvatarMeta } from '../types'
import { setUserAddress } from './bind'

const NFTAvatarStorage = (pluginId: NetworkPluginID, network: string) =>
    KeyValue.createJSON_Storage(NFT_AVATAR_METADATA_STORAGE + '_' + pluginId + '_' + network)

export async function saveAvatar(account: string, network: string, avatar: NextIDAvatarMeta) {
    await setUserAddress(avatar.userId, account, network, avatar.pluginId ?? NetworkPluginID.PLUGIN_EVM, avatar.chainId)
    await NFTAvatarStorage(avatar.pluginId ?? NetworkPluginID.PLUGIN_EVM, network).set(avatar.userId, avatar)
}

export async function getAvatar(pluginId: NetworkPluginID, userId: string, network: string) {
    return NFTAvatarStorage(pluginId, network).get<NextIDAvatarMeta>(userId)
}
