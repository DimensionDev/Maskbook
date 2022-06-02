import { KeyValue } from '@masknet/web3-providers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { NFT_AVATAR_METADATA_STORAGE } from '../constants'
import type { NextIDAvatarMeta } from '../types'

const NFTAvatarStorage = (pluginId: NetworkPluginID) =>
    KeyValue.createJSON_Storage(NFT_AVATAR_METADATA_STORAGE + '_' + pluginId)

type SaveType = Record<string, Record<string, NextIDAvatarMeta>>
export async function saveAvatar(
    pluginId: NetworkPluginID,
    account: string,
    networkType: string,
    avatar: NextIDAvatarMeta,
) {
    let data = await NFTAvatarStorage(pluginId).get<SaveType>(account)
    if (!data) {
        data = {
            [networkType]: {
                [avatar.userId]: avatar,
            },
        } as SaveType
    } else {
        data = {
            ...data,
            [networkType]: {
                [avatar.userId]: avatar,
            },
        }
    }
    console.log(data)
    // await NFTAvatarStorage(pluginId).set(account, data)
}
