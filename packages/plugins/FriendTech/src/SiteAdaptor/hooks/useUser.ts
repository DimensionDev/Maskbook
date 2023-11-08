import { FriendTech } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

export function useUser(address?: string) {
    return useQuery({
        enabled: !!address,
        queryKey: ['friend-tech', 'user', address],
        queryFn: () => FriendTech.getUser(address),
    })
}
