import type { EnhanceableSite } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'
import { activatedSocialNetworkUI } from '../../../social-network'
import { PluginNFTAvatarRPC } from '../messages'

export function useWallet(userId: string, pluginId: NetworkPluginID) {
    return useAsyncRetry(async () => {
        return PluginNFTAvatarRPC.getAddress(
            activatedSocialNetworkUI.networkIdentifier as EnhanceableSite,
            userId,
            pluginId,
        )
    }, [pluginId, userId])
}
