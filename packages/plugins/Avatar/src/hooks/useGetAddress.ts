import { useCallback } from 'react'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { type EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import { NFT_AVATAR_DB_NAME } from '../constants.js'
import type { AddressStorageV1, AddressStorageV2 } from '../types.js'

export function useGetAddress() {
    const { Storage } = useWeb3State()
    return useCallback(
        async (site: EnhanceableSite, userId: string) => {
            if (userId === '$unknown' || !Storage) return

            let storageV1, storageV2
            try {
                const storage = await Storage.createKVStorage(`${NFT_AVATAR_DB_NAME}_${site}`).get(userId)
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

            return
        },
        [Storage],
    )
}
