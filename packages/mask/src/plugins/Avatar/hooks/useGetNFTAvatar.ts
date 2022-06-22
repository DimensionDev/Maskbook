import type { EnhanceableSite } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'
import type { RSS3_KEY_SNS } from '../constants'
import { PluginNFTAvatarRPC } from '../messages'
import { getAddress } from '../Services'
import { useGetNFTAvatarFromRSS3 } from './rss3/useGetNFTAvatarFromRSS3'

export function useGetNFTAvatar() {
    const [, getNFTAvatarFromRSS] = useGetNFTAvatarFromRSS3()

    return useAsyncFn(
        async (userId?: string, network?: EnhanceableSite, snsKey?: RSS3_KEY_SNS) => {
            if (!userId || !network || !snsKey) return
            const storage = await getAddress(network, userId)
            if (!storage?.address) return
            if (storage?.networkPluginID && storage.networkPluginID !== NetworkPluginID.PLUGIN_EVM) {
                return PluginNFTAvatarRPC.getAvatar(userId, network)
            }
            return getNFTAvatarFromRSS(userId, storage.address, snsKey)
        },
        [getNFTAvatarFromRSS],
    )
}
