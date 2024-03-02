import { useAsyncFn } from 'react-use'
import { Web3Storage } from '@masknet/web3-providers'
import type { AvatarNextID } from '@masknet/web3-providers/types'
import { type NetworkPluginID, getEnhanceableSiteType, EnhanceableSite } from '@masknet/shared-base'
import { useSaveAddress } from './useSaveAddress.js'
import { PLUGIN_NAME } from '../constants.js'

export function useSaveStringStorage(pluginID: NetworkPluginID) {
    const [, saveAddress] = useSaveAddress()

    return useAsyncFn(
        async (userId: string, address: string, avatar: AvatarNextID<NetworkPluginID>) => {
            const stringStorage = Web3Storage.createFireflyStorage(
                `${PLUGIN_NAME}-${(getEnhanceableSiteType() || EnhanceableSite.Twitter).replace('.com', '')}`,
                address,
            )
            await stringStorage.set?.(userId, avatar)
            await saveAddress(avatar.userId, pluginID, address, getEnhanceableSiteType())

            return avatar
        },
        [saveAddress],
    )
}
