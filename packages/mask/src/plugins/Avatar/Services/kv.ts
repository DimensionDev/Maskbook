import type { EnhanceableSite } from '@masknet/shared-base'
import { KeyValue } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { NFT_AVATAR_DB_NAME } from '../constants'

type AddressStorageV1 = { address: string; networkPluginID: NetworkPluginID }
type AddressStorageV2 = Record<string, AddressStorageV1> & Record<NetworkPluginID, string>

const cache = new Map<string, Promise<AddressStorageV1 | undefined>>()

// The DB contains data that an SNS identity handle maps to a Web3 address.
const createAddressDB = (site: EnhanceableSite) =>
    KeyValue.createJSON_Storage<AddressStorageV1 | AddressStorageV2>(`${NFT_AVATAR_DB_NAME}_${site}`)

function getKey(site: EnhanceableSite, userId: string) {
    return `${site}-${userId}`
}
export async function getAddress(
    site: EnhanceableSite,
    userId: string,
    pluginID?: NetworkPluginID,
): Promise<{ address: string; networkPluginID: NetworkPluginID } | undefined> {
    let f = cache.get(getKey(site, userId))
    if (f) return f
    f = _getAddress(site, userId, pluginID)
    cache.set(getKey(site, userId), f)
    return f
}

async function _getAddress(
    site: EnhanceableSite,
    userId: string,
    pluginID?: NetworkPluginID,
): Promise<{ address: string; networkPluginID: NetworkPluginID } | undefined> {
    if (userId === '$unknown') return

    let storageV1, storageV2
    try {
        const storage = await createAddressDB(site).get(userId)
        storageV1 = (storage ?? {}) as AddressStorageV1
        storageV2 = (storage ?? {}) as AddressStorageV2
    } catch {
        storageV1 = {} as AddressStorageV1
        storageV2 = {} as AddressStorageV2
    }

    if (!pluginID && storageV2[userId]) return storageV2[userId]
    if (storageV2[pluginID ?? NetworkPluginID.PLUGIN_EVM])
        return {
            address: storageV2[pluginID ?? NetworkPluginID.PLUGIN_EVM],
            networkPluginID: pluginID ?? NetworkPluginID.PLUGIN_EVM,
        }

    // V1 only supports EVM
    if (storageV1.address && pluginID === NetworkPluginID.PLUGIN_EVM) return storageV1

    return
}

export async function setAddress(site: EnhanceableSite, userId: string, pluginID: NetworkPluginID, address: string) {
    if (userId === '$unknown') return

    let storageV2
    try {
        const storage = await createAddressDB(site).get(userId)
        storageV2 = (storage ?? {}) as AddressStorageV2
    } catch {
        storageV2 = {} as AddressStorageV2
    }

    // clear cache
    cache.delete(getKey(site, userId))

    await createAddressDB(site).set(userId, {
        ...(storageV2 as AddressStorageV2),
        [pluginID]: address,
        [userId]: { address, networkPluginID: pluginID },
    } as AddressStorageV2)
}
