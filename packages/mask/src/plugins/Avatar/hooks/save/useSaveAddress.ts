import { useCallback } from 'react'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID, EnhanceableSite } from '@masknet/shared-base'
import { NFT_AVATAR_DB_NAME } from '../../constants.js'
import type { AddressStorageV2 } from '../../types.js'

export function useSaveAddress(pluginId?: NetworkPluginID) {
    const { Storage } = useWeb3State(pluginId)

    return useCallback(
        async (userId: string, pluginId: NetworkPluginID, account: string, network: EnhanceableSite) => {
            if (!Storage) return
            const addressStorage = Storage.createKVStorage(`${NFT_AVATAR_DB_NAME}_${network}`)
            if (!addressStorage) return

            const prevData = (await addressStorage.get<AddressStorageV2>(userId).catch(() => ({}))) as
                | AddressStorageV2
                | undefined

            await addressStorage.set<AddressStorageV2>(userId, {
                ...(prevData ?? {}),
                [pluginId ?? NetworkPluginID.PLUGIN_EVM]: account,
                [userId]: { address: account, networkPluginID: pluginId ?? NetworkPluginID.PLUGIN_EVM },
            } as AddressStorageV2)
        },
        [Storage],
    )
}
