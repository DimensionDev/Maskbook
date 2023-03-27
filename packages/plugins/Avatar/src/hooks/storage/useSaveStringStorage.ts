import { type NetworkPluginID, getEnhanceableSiteType } from '@masknet/shared-base'
import { useCallback } from 'react'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { useSaveAddress } from '../index.js'
import type { NextIDAvatarMeta } from '../../types.js'
import { PLUGIN_NAME } from '../../constants.js'

export function useSaveStringStorage(pluginID: NetworkPluginID) {
    const { Storage } = useWeb3State(pluginID)
    const saveAddress = useSaveAddress()

    return useCallback(
        async (userId: string, address: string, nft: NextIDAvatarMeta) => {
            if (!Storage) return
            const stringStorage = Storage.createStringStorage(PLUGIN_NAME, address)
            await stringStorage.set?.<string>(userId, JSON.stringify(nft))
            await saveAddress(nft.userId, pluginID, address, getEnhanceableSiteType())
            return nft
        },
        [Storage, saveAddress],
    )
}
