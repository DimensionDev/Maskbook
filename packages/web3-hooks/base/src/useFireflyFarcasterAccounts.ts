import { skipToken, useQuery } from '@tanstack/react-query'
import { FireflyConfig, Twitter } from '@masknet/web3-providers'
import { EMPTY_LIST } from '@masknet/shared-base'

export function useFireflyFarcasterAccounts(userId?: string) {
    const { data: user } = useQuery({
        queryKey: ['twitter', 'profile', userId],
        queryFn: userId ? () => Twitter.getUserByScreenName(userId) : skipToken,
    })
    return useQuery({
        queryKey: ['union-profile', 'by-twitter-id', userId],
        retry: 0,
        staleTime: 60_000,
        queryFn: async () => {
            if (!user?.userId) return
            const unionProfile = await FireflyConfig.getUnionProfile({
                twitterId: user?.userId,
            })
            return unionProfile.farcasterProfiles ?? EMPTY_LIST
        },
    })
}
