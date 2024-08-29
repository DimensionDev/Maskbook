import { useQuery } from '@tanstack/react-query'
import { FireflyConfig, Twitter } from '@masknet/web3-providers'
import { EMPTY_LIST } from '@masknet/shared-base'

export function useFireflyFarcasterAccounts(userId?: string) {
    return useQuery({
        queryKey: ['union-profile', 'by-twitter-id', userId],
        retry: 0,
        staleTime: 60_000,
        queryFn: async () => {
            if (!userId) return EMPTY_LIST
            const user = await Twitter.getUserByScreenName(userId)
            if (!user?.userId) return
            const unionProfile = await FireflyConfig.getUnionProfile({
                twitterId: user?.userId,
            })
            return unionProfile.farcasterProfiles ?? EMPTY_LIST
        },
    })
}
