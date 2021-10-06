import { useAsync } from 'react-use'
import { PluginNFTAvatarRPC } from '../messages'

export function useNFTAvatar(userId: string) {
    return useAsync(async () => {
        if (!userId) return
        const avatar = await PluginNFTAvatarRPC.getNFTAvatar(userId)
        return avatar
    }, [userId]).value
}
