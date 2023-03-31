import { useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useCallback } from 'react'
import { StorageKey } from '../../constants.js'
import type { NextIDAvatarMeta } from '../../types.js'

export function useGetNFTAvatarFromStorage() {
    const { Storage } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    return useCallback(
        async (userId: string, address: string) => {
            if (!Storage) return
            const stringStorage = Storage.createStringStorage(StorageKey, address)
            return stringStorage.get?.<NextIDAvatarMeta>(userId)
        },
        [Storage],
    )
}
