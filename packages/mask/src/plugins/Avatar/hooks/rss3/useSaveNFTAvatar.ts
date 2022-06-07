import type { EnhanceableSite } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'
import type { RSS3_KEY_SNS } from '../../constants'
import { PluginNFTAvatarRPC } from '../../messages'
import type { AvatarMetaDB } from '../../types'
import { useSaveAvatarToRSS3 } from './useSaveNFTAvatarToRSS3'

export function useSaveNFTAvatar() {
    const [, saveAvatarToRSS3] = useSaveAvatarToRSS3()

    return useAsyncFn(
        async (
            address: string,
            nft: AvatarMetaDB,
            network: EnhanceableSite,
            snsKey: RSS3_KEY_SNS,
            networkPluginId?: NetworkPluginID,
            chainId?: number,
        ) => {
            const avatar = await saveAvatarToRSS3(address, nft, '', snsKey)
            await PluginNFTAvatarRPC.setAddress(
                network,
                nft.userId,
                networkPluginId ?? NetworkPluginID.PLUGIN_EVM,
                address,
            )
            return avatar
        },
        [saveAvatarToRSS3],
    )
}
