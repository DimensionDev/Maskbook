import type { EnhanceableSite } from '@masknet/shared-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsync } from 'react-use'
import { PluginNFTAvatarRPC } from '../../messages'

export function useGetUserAddress(
    userId: string,
    network: EnhanceableSite,
    networkPluginId?: NetworkPluginID,
    chainId?: number,
) {
    return useAsync(async () => {
        return PluginNFTAvatarRPC.getAddress(network, userId, networkPluginId ?? NetworkPluginID.PLUGIN_EVM)
    }, [userId, network, networkPluginId, chainId])
}
