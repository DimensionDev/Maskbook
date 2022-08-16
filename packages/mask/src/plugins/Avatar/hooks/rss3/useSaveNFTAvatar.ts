import type { EnhanceableSite } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCallback } from 'react'
import type { RSS3_KEY_SNS } from '../../constants'
import type { AvatarMetaDB } from '../../types'
import { useSaveAvatarToRSS3 } from './useSaveNFTAvatarToRSS3'
import { useSaveAddress } from '../save/useSaveAddress'

export function useSaveNFTAvatar() {
    const saveAvatarToRSS3 = useSaveAvatarToRSS3()
    const saveAddress = useSaveAddress()
    return useCallback(
        async (
            address: string,
            nft: AvatarMetaDB,
            network: EnhanceableSite,
            snsKey: RSS3_KEY_SNS,
            networkPluginId?: NetworkPluginID,
        ) => {
            const avatar = await saveAvatarToRSS3(address, nft, '', snsKey)

            saveAddress(nft.userId, networkPluginId ?? NetworkPluginID.PLUGIN_EVM, address, network)

            return avatar
        },
        [saveAvatarToRSS3, saveAddress],
    )
}
