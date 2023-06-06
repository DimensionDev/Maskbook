import { useCallback } from 'react'
import { Web3Storage } from '@masknet/web3-providers'
import { type NetworkPluginID, getEnhanceableSiteType, EnhanceableSite, getSiteType } from '@masknet/shared-base'
import { useSaveAddress } from '../index.js'
import type { NextIDAvatarMeta } from '../../types.js'
import { PLUGIN_NAME } from '../../constants.js'

export function useSaveStringStorage(pluginID: NetworkPluginID) {
    const saveAddress = useSaveAddress()

    return useCallback(
        async (userId: string, address: string, nft: NextIDAvatarMeta) => {
            const stringStorage = Web3Storage.createFireflyStorage(
                `${PLUGIN_NAME}-${(getSiteType() || EnhanceableSite.Twitter).replace('.com', '')}`,
                address,
            )
            try {
                await stringStorage.set(userId, nft)
                await saveAddress(nft.userId, pluginID, address, getEnhanceableSiteType())
                return nft
            } catch {
                return
            }
        },
        [Storage, saveAddress],
    )
}
