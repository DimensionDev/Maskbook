import { useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useCallback } from 'react'
import type { NextIDAvatarMeta } from '../../types.js'
import { PLUGIN_NAME } from '../../constants.js'

export function useGetNFTAvatarFromFirefly() {
    const { Storage } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    return useCallback(
        async (userId: string, address: string) => {
            if (!Storage) return
            const fireflyStorage = Storage.createFireflyStorage(PLUGIN_NAME, userId, address)
            return fireflyStorage.getData?.<NextIDAvatarMeta>()
        },
        [Storage],
    )
}
