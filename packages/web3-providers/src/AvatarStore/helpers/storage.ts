import { EnhanceableSite, type NetworkPluginID, getEnhanceableSiteType } from '@masknet/shared-base'
import type { AvatarNextID } from '../types.js'
import { Web3Storage } from '../../Storage/apis/Storage.js'

const KEY = `Avatar-${(getEnhanceableSiteType() || EnhanceableSite.Twitter).replace('.com', '')}`

export function getAvatarFromStorage(userId: string, address: string) {
    const stringStorage = Web3Storage.createFireflyStorage(KEY, address)
    return stringStorage.get?.<AvatarNextID<NetworkPluginID.PLUGIN_EVM>>(userId)
}

export function setAvatarToStorage<T extends NetworkPluginID = NetworkPluginID.PLUGIN_EVM>(
    userId: string,
    address: string,
    avatar: AvatarNextID<T>,
) {
    const stringStorage = Web3Storage.createFireflyStorage(KEY, address)
    return stringStorage.set?.<AvatarNextID<T>>(userId, avatar)
}
