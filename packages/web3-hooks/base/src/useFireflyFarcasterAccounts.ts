import { skipToken, useQuery } from '@tanstack/react-query'
import { FireflyConfig, Twitter } from '@masknet/web3-providers'
import { EMPTY_LIST } from '@masknet/shared-base'

export function useFireflyFarcasterAccounts(identity?: string) {
    identity = identity?.toLowerCase()
    const { data: user } = useQuery({
        queryKey: ['twitter', 'profile', identity],
        staleTime: 3600_000,
        refetchOnWindowFocus: false,
        queryFn: identity ? () => Twitter.getUserByScreenName(identity) : skipToken,
    })
    const id = user?.userId.toLowerCase()

    return useQuery({
        queryKey: ['union-profile', 'by-twitter-id', id],
        retry: 0,
        staleTime: 60_000,
        queryFn:
            id ?
                async () => {
                    const unionProfile = await FireflyConfig.getUnionProfile({
                        twitterId: id,
                    })
                    return unionProfile.farcasterProfiles ?? EMPTY_LIST
                }
            :   skipToken,
    })
}
