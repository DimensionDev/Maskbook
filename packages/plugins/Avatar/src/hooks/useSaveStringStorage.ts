import { getEnhanceableSiteType, type NetworkPluginID } from '@masknet/shared-base'
import { setAvatarToStorage } from '@masknet/web3-providers'
import type { AvatarNextID } from '@masknet/web3-providers/types'
import { useSaveAddress } from './useSaveAddress.js'
import { useCallback } from 'react'

export function useSaveStringStorage(pluginID: NetworkPluginID) {
    const saveAddress = useSaveAddress()

    return useCallback(
        async (userId: string, address: string, avatar: AvatarNextID<NetworkPluginID>) => {
            await setAvatarToStorage(userId, address, avatar)
            await saveAddress(avatar.userId, pluginID, address, getEnhanceableSiteType())

            return avatar
        },
        [saveAddress],
    )
}
