import type { EnhanceableSite } from '@masknet/shared-base'
import { KeyValue } from '@masknet/web3-providers'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
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

    const storage = await createAddressDB(site).get(userId)
    const storageV1 = storage as AddressStorageV1
    const storageV2 = storage as AddressStorageV2

    if (!pluginID) return storageV2[userId] as AddressStorageV1
    if (storageV2[pluginID])
        return {
            address: storageV2[pluginID],
            networkPluginID: pluginID,
        }

    // V1 only supports EVM
    if (storageV1.address && pluginID === NetworkPluginID.PLUGIN_EVM) return storageV1

    return
}

export async function setAddress(site: EnhanceableSite, userId: string, pluginID: NetworkPluginID, address: string) {
    if (userId === '$unknown') return

    const storage = await createAddressDB(site).get(userId)
    const storageV2 = storage as AddressStorageV2

    if (!isSameAddress(address, storageV2[pluginID])) {
        // clear cache
        cache.delete(getKey(site, userId))

        await createAddressDB(site).set(userId, {
            [userId]: { address, networkPluginID: pluginID },
            ...(storageV2 as AddressStorageV2),
            [pluginID]: address,
        } as AddressStorageV2)
    }
}
