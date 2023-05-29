import { useCallback } from 'react'
import { Web3Storage } from '@masknet/web3-providers'
import { type NetworkPluginID, EnhanceableSite } from '@masknet/shared-base'
import { NFT_AVATAR_DB_NAME } from '../../constants.js'
import type { AddressStorageV2 } from '../../types.js'

export function useSaveAddress(pluginID?: NetworkPluginID) {
    return useCallback(
        async (userId: string, pluginID: NetworkPluginID, account: string, network?: EnhanceableSite) => {
            const addressStorage = Web3Storage.createKVStorage(
                `${NFT_AVATAR_DB_NAME}_${network ?? EnhanceableSite.Twitter}`,
            )
            if (!addressStorage) return

            const prevData = (await addressStorage.get<AddressStorageV2>(userId).catch(() => ({}))) as
                | AddressStorageV2
                | undefined

            await addressStorage.set<AddressStorageV2>(userId, {
                ...prevData,
                [pluginID]: account,
                [userId]: { address: account, networkPluginID: pluginID },
            } as AddressStorageV2)
        },
        [],
    )
}
