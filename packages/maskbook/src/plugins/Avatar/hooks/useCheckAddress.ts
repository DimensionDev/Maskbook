import { isSameAddress } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import { PluginNFTAvatarRPC } from '../messages'
import { getNFTAvatarFromJSON } from '../Services/db'

export function useCheckAddress(userId: string, owner: string) {
    return useAsync(async () => {
        if (!userId) return false
        const address = await PluginNFTAvatarRPC.getAddress(userId)
        if (!address) {
            const avatar = await getNFTAvatarFromJSON(userId)
            return !!avatar
        }

        return isSameAddress(address, owner)
    }, [userId, owner]).value
}
