import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { FriendTech } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

/** Get my friend tech address binding to current twitter account */
export function useMyAddress() {
    const identity = useLastRecognizedIdentity()
    const userId = identity?.identifier?.userId
    const { data: user } = useQuery({
        queryKey: ['friend-tech', 'user', userId],
        queryFn: () => FriendTech.getUserInfo(userId),
    })
    return user?.address
}
