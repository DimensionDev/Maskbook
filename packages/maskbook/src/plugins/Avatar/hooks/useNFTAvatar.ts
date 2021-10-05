import { useWeb3 } from '@masknet/web3-shared'
import { useAsync } from 'react-use'
import { PluginNFTAvatarRPC } from '../messages'

export function useNFTAvatar(userId: string) {
    const web3 = useWeb3()

    return useAsync(async () => {
        if (!userId) return
        console.log(userId)
        const avatar = await PluginNFTAvatarRPC.getNFTAvatar(userId)
        return avatar
    }, [userId, web3]).value
}
