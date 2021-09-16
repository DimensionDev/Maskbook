import { useAsync } from 'react-use'
import { getNFTAvatar } from '../gun'

export function useNFTAvatar(userId?: string) {
    return useAsync(async () => {
        if (!userId) return undefined

        const avatar = await getNFTAvatar(userId)
        return avatar
    }, [userId]).value
}
