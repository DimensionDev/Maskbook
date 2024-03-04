import { Web3Storage } from '@masknet/web3-providers'
import { type EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import type { AddressStorageV1, AddressStorageV2 } from '../types.js'

const NFT_AVATAR_DB_NAME = 'com.maskbook.user'

export async function getAddress(siteType: EnhanceableSite, userId: string) {
    if (userId === '$unknown') return null

    let storageV1, storageV2

    try {
        const storage = await Web3Storage.createKVStorage(`${NFT_AVATAR_DB_NAME}_${siteType}`).get(userId)
        storageV1 = (storage ?? {}) as AddressStorageV1
        storageV2 = (storage ?? {}) as AddressStorageV2
    } catch {
        storageV1 = {} as AddressStorageV1
        storageV2 = {} as AddressStorageV2
    }

    if (storageV2[userId]) return storageV2[userId]
    if (storageV2[NetworkPluginID.PLUGIN_EVM])
        return {
            address: storageV2[NetworkPluginID.PLUGIN_EVM],
            networkPluginID: NetworkPluginID.PLUGIN_EVM,
        }

    // V1 only supports EVM
    if (storageV1.address) return storageV1

    return null
}
