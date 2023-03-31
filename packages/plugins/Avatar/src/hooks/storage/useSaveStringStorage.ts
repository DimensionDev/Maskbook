import { type NetworkPluginID, getEnhanceableSiteType, EnhanceableSite, getSiteType } from '@masknet/shared-base'
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
            const stringStorage = Storage.createStringStorage(
                `${PLUGIN_NAME}-${(getSiteType() || EnhanceableSite.Twitter).replace('.com', '')}`,
                address,
            )
            await stringStorage.set?.(userId, nft)
            await saveAddress(nft.userId, pluginID, address, getEnhanceableSiteType())
            return nft
        },
        [Storage, saveAddress],
    )
}
