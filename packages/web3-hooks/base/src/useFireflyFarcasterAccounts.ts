import { skipToken, useQuery } from '@tanstack/react-query'
import { FireflyConfig, FireflyTwitter } from '@masknet/web3-providers'
import { EMPTY_LIST } from '@masknet/shared-base'

export function useFireflyFarcasterAccounts(identity?: string) {
    const { data: user } = useQuery({
        queryKey: ['twitter', 'profile', identity],
        staleTime: 3600_000,
        refetchOnWindowFocus: false,
        queryFn: identity ? () => FireflyTwitter.getUserInfo(identity) : skipToken,
    })
    const id = user?.rest_id

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
