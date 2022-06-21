import type { EnhanceableSite } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'
import type { RSS3_KEY_SNS } from '../../constants'
import { PluginNFTAvatarRPC } from '../../messages'
import type { AvatarMetaDB, NFT_USAGE } from '../../types'
import { useSaveAvatarToRSS3 } from './useSaveNFTAvatarToRSS3'

export function useSaveNFTAvatar() {
    const [, saveAvatarToRSS3] = useSaveAvatarToRSS3()

    return useAsyncFn(
        async (
            address: string,
            nft: AvatarMetaDB,
            network: EnhanceableSite,
            snsKey: RSS3_KEY_SNS,
            nftUsage: NFT_USAGE,
            networkPluginId?: NetworkPluginID,
            chainId?: number,
        ) => {
            const avatar = await saveAvatarToRSS3(address, nft, '', snsKey, nftUsage)
            await PluginNFTAvatarRPC.setAddress(
                network,
                nft.userId,
                networkPluginId ?? NetworkPluginID.PLUGIN_EVM,
                address,
                nftUsage,
            )
            return avatar
        },
        [saveAvatarToRSS3],
    )
}
