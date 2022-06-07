import type { EnhanceableSite } from '@masknet/shared-base'
import { KeyValue } from '@masknet/web3-providers'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { NFT_AVATAR_DB_NAME } from '../constants'

type AddressStorageV1 = { address: string; networkId: NetworkPluginID }
type AddressStorageV2 = Record<NetworkPluginID, string>

// The DB contains data that an SNS identity handle maps to a Web3 address.
const createAddressDB = (site: EnhanceableSite) =>
    KeyValue.createJSON_Storage<AddressStorageV1 | AddressStorageV2>(`${NFT_AVATAR_DB_NAME}_${site}`)

export async function getAddress(site: EnhanceableSite, userId: string, pluginID: NetworkPluginID): Promise<string> {
    if (userId === '$unknown') return ''

    const storage = await createAddressDB(site).get(userId)
    const storageV1 = storage as AddressStorageV1
    const storageV2 = storage as AddressStorageV2

    if (storageV2[pluginID]) return storageV2[pluginID]

    // V1 only supports EVM
    if (storageV1.address && pluginID === NetworkPluginID.PLUGIN_EVM) return storageV1.address

    return ''
}

export async function setAddress(site: EnhanceableSite, userId: string, pluginID: NetworkPluginID, address: string) {
    if (userId === '$unknown') return

    const storage = await createAddressDB(site).get(userId)
    const storageV2 = storage as AddressStorageV2

    if (!isSameAddress(address, storageV2[pluginID])) {
        await createAddressDB(site).set(userId, {
            ...(storageV2 as AddressStorageV2),
            [pluginID]: address,
        })
    }
}
