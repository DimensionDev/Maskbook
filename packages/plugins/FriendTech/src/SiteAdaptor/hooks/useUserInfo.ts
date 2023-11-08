import { FriendTech } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

/** Get user info by twitter user id */
export function useUserInfo(userId: string | undefined) {
    return useQuery({
        enabled: !!userId,
        queryKey: ['friend-tech', 'twitter-user', userId],
        queryFn: () => FriendTech.getUserInfo(userId),
    })
}
