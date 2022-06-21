import type { EnhanceableSite } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'
import type { RSS3_KEY_SNS } from '../constants'
import { PluginNFTAvatarRPC } from '../messages'
import { getAddress } from '../Services'
import { NextIDAvatarMeta, NFT_USAGE } from '../types'
import { useGetNFTAvatarFromRSS3 } from './rss3/useGetNFTAvatarFromRSS3'

export function useGetNFTAvatar() {
    const [, getNFTAvatarFromRSS] = useGetNFTAvatarFromRSS3()

    return useAsyncFn(
        async (userId?: string, network?: EnhanceableSite, snsKey?: RSS3_KEY_SNS, nftUsage?: NFT_USAGE) => {
            if (!userId || !network || !snsKey) return
            const storage = await getAddress(network, userId, nftUsage)
            if (!storage?.address) return
            if (storage?.networkPluginID && storage.networkPluginID !== NetworkPluginID.PLUGIN_EVM) {
                const result = await PluginNFTAvatarRPC.getAvatar(userId, network)
                return nftUsage !== NFT_USAGE.NFT_BACKGROUND ? (result as NextIDAvatarMeta) : result?.background
            }
            return getNFTAvatarFromRSS(userId, storage.address, snsKey, nftUsage ?? NFT_USAGE.NFT_PFP)
        },
        [getNFTAvatarFromRSS],
    )
}
