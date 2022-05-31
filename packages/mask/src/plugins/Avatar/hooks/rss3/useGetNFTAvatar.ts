import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncFn } from 'react-use'
import type { RSS3_KEY_SNS } from '../../constants'
import { PluginNFTAvatarRPC } from '../../messages'
import { useGetNFTAvatarFromRSS3 } from './useGetNFTAvatarFromRSS3'

export function useGetNFTAvatar() {
    const [, getNFTAvatarFromRSS] = useGetNFTAvatarFromRSS3()

    return useAsyncFn(
        async (
            userId?: string,
            network?: string,
            snsKey?: RSS3_KEY_SNS,
            networkPluginId?: NetworkPluginID,
            chainId?: number,
        ) => {
            if (!userId || !network || !snsKey) return
            const address = await PluginNFTAvatarRPC.getUserAddress(userId, network, networkPluginId, chainId)
            if (!address) return
            return getNFTAvatarFromRSS(userId, address, snsKey)
        },
        [getNFTAvatarFromRSS],
    )
}
