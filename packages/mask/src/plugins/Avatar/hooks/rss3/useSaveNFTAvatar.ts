import type { NetworkPluginID } from '@masknet/web3-shared-base'
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
            network: string,
            snsKey: RSS3_KEY_SNS,
            networkPluginId?: NetworkPluginID,
            chainId?: number,
        ) => {
            const avatar = await saveAvatarToRSS3(address, nft, '', snsKey)
            await PluginNFTAvatarRPC.setUserAddress(nft.userId, address, network, networkPluginId, chainId)
            return avatar
        },
        [saveAvatarToRSS3],
    )
}
