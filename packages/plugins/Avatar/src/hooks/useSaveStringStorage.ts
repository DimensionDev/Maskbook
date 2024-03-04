import { Web3Storage } from '@masknet/web3-providers'
import { type NetworkPluginID, getEnhanceableSiteType, EnhanceableSite } from '@masknet/shared-base'
import { useSaveAddress } from './useSaveAddress.js'
import type { NextIDAvatarMeta } from '../types.js'
import { PLUGIN_NAME } from '../constants.js'
import { useAsyncFn } from 'react-use'

export function useSaveStringStorage(pluginID: NetworkPluginID) {
    const [, saveAddress] = useSaveAddress()

    return useAsyncFn(
        async (userId: string, address: string, nft: NextIDAvatarMeta) => {
            const stringStorage = Web3Storage.createFireflyStorage(
                `${PLUGIN_NAME}-${(getEnhanceableSiteType() || EnhanceableSite.Twitter).replace('.com', '')}`,
                address,
            )
            await stringStorage.set?.(userId, nft)
            await saveAddress(nft.userId, pluginID, address, getEnhanceableSiteType())

            return nft
        },
        [saveAddress],
    )
}
