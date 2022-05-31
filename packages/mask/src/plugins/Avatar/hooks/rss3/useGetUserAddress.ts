import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsync } from 'react-use'
import { PluginNFTAvatarRPC } from '../../messages'

export function useGetUserAddress(
    userId: string,
    network: string,
    networkPluginId?: NetworkPluginID,
    chainId?: number,
) {
    return useAsync(async () => {
        return PluginNFTAvatarRPC.getUserAddress(userId, network, networkPluginId, chainId)
    }, [userId, network, networkPluginId, chainId])
}
