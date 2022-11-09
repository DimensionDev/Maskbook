import { useCallback } from 'react'
import { EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import type { RSS3_KEY_SNS } from '../../constants.js'
import type { AvatarMetaDB } from '../../types.js'
import { useSaveAvatarToRSS3 } from './useSaveNFTAvatarToRSS3.js'
import { useSaveAddress } from '../save/useSaveAddress.js'

export function useSaveNFTAvatar() {
    const saveAvatarToRSS3 = useSaveAvatarToRSS3()
    const saveAddress = useSaveAddress()
    return useCallback(
        async (
            address: string,
            nft: AvatarMetaDB,
            network: EnhanceableSite,
            snsKey: RSS3_KEY_SNS,
            pluginID?: NetworkPluginID,
        ) => {
            const avatar = await saveAvatarToRSS3(address, nft, '', snsKey)

            saveAddress(nft.userId, pluginID ?? NetworkPluginID.PLUGIN_EVM, address, network)

            return avatar
        },
        [saveAvatarToRSS3, saveAddress],
    )
}
