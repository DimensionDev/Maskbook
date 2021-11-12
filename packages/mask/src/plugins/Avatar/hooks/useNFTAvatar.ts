import { useAsync } from 'react-use'
import { PluginNFTAvatarRPC } from '../messages'

export function useNFTAvatar(userId: string) {
    return useAsync(async () => {
        if (!userId) return
        if (userId === '$unknown') return

        return PluginNFTAvatarRPC.getNFTAvatar(userId)
    }, [userId])
}
