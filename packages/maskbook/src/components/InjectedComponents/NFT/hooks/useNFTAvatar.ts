import { useWeb3 } from '@masknet/web3-shared'
import { useAsync } from 'react-use'
import { getNFTAvatar } from '../gun'

export function useNFTAvatar(userId: string) {
    const web3 = useWeb3()

    return useAsync(async () => {
        if (!userId) return
        const avatar = await getNFTAvatar(userId, web3)
        return avatar
    }, [userId, web3]).value
}
