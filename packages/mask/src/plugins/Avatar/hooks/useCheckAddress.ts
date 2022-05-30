import { isSameAddress } from '@masknet/web3-shared-base'
import { useAsync } from 'react-use'
import { activatedSocialNetworkUI } from '../../../social-network'
import { PluginNFTAvatarRPC } from '../messages'
import { getNFTAvatarFromJSON } from '../Services/db'

export function useCheckAddress(userId: string, owner: string) {
    return useAsync(async () => {
        if (!userId) return false
        const address = await PluginNFTAvatarRPC.getAddress(userId, activatedSocialNetworkUI.networkIdentifier)
        if (!address) {
            const avatar = await getNFTAvatarFromJSON(userId)
            return !!avatar
        }

        return isSameAddress(address, owner)
    }, [userId, owner, activatedSocialNetworkUI.networkIdentifier]).value
}
