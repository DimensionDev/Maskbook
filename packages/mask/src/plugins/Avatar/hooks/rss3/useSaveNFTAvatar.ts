import { useCallback } from 'react'
import { EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import type { RSS3_KEY_SNS } from '../../constants.js'
import type { AvatarMetaDB } from '../../types.js'
import { useSaveAvatarToRSS3 } from './useSaveNFTAvatarToRSS3.js'
import { useSaveAddress } from '../save/useSaveAddress.js'
import { useChainContext } from '@masknet/web3-hooks-base'

export function useSaveNFTAvatar() {
    const chainId = useChainContext()
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
            try {
                const avatar = await saveAvatarToRSS3(address, nft, '', snsKey)
                await saveAddress(nft.userId, pluginID ?? NetworkPluginID.PLUGIN_EVM, address, network)
                return avatar
            } catch (error) {
                console.error(error)
                throw error
            }
        },
        [saveAvatarToRSS3, saveAddress],
    )
}
