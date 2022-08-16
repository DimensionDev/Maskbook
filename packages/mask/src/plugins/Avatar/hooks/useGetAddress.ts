import { useWeb3State } from '@masknet/plugin-infra/web3'
import type { EnhanceableSite } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCallback } from 'react'
import type { AddressStorageV1, AddressStorageV2 } from '../types'

export function useGetAddress() {
    const { Storage } = useWeb3State()
    return useCallback(
        async (site: EnhanceableSite, userId: string) => {
            if (userId === '$unknown' || !Storage) return

            let storageV1, storageV2
            try {
                const storage = await Storage.createKVStorage(site).get(userId)
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
