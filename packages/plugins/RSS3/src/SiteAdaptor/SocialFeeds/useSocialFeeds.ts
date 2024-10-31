import { EMPTY_LIST } from '@masknet/shared-base'
import { useFireflyFarcasterAccounts, useFireflyLensAccounts } from '@masknet/web3-hooks-base'
import { FireflyConfig, FireflyFarcaster, Lens } from '@masknet/web3-providers'
import { useQuery, useInfiniteQuery, skipToken } from '@tanstack/react-query'
import { sortBy } from 'lodash-es'
import { useCallback } from 'react'

interface Options {
    userId: string | undefined
    address: string | undefined
}

export function useSocialFeeds({ userId, address }: Options) {
    const { data: farAccounts = EMPTY_LIST } = useFireflyFarcasterAccounts(userId)
    const { data: lensAccounts = EMPTY_LIST } = useFireflyLensAccounts(userId, true)

    const { data: profiles } = useQuery({
        queryKey: ['firefly', 'profiles-by-address', address],
        queryFn: address ? () => FireflyConfig.getUnionProfile({ walletAddress: address }) : skipToken,
    })
    const { farcasterProfiles = [], lensProfiles = [], lensProfilesV3 = [] } = profiles || {}

    const fids = userId ? farAccounts.map((x) => x.id) : farcasterProfiles.map((x) => x.fid) || []
    const {
        data: farcasterPosts = EMPTY_LIST,
        error: farcasterError,
        fetchNextPage: fetchNextFarcasterPage,
        isFetchingNextPage: isFetchingFarcasterNextPage,
        isPending: pendingFarcaster,
        hasNextPage: hasNextFarcasterPage,
        isLoading: isLoadingFarcaster,
    } = useInfiniteQuery({
        queryKey: ['social-feeds', 'farcaster', fids],
        queryFn: async ({ pageParam }) => {
            return FireflyFarcaster.getPostsByProfileId(fids, pageParam)
        },
        initialPageParam: undefined as any,
        getNextPageParam: (lastPage) => lastPage?.nextIndicator,
        select(res) {
            return res.pages.flatMap((page) => page.data)
        },
    })

    const lensHandles =
        userId ?
            lensAccounts.map((x) => x.handle)
        :   [...lensProfiles.map((x) => x.handle), ...lensProfilesV3.map((x) => x.localName)]
    const { data: lensIds = EMPTY_LIST } = useQuery({
        queryKey: ['lens', 'popup-list', lensHandles],
        queryFn: async () => {
            const profiles = await Lens.getProfilesByHandles(lensHandles)
            return profiles.map((x) => x.id)
        },
    })
    const {
        data: lensPosts = EMPTY_LIST,
        error: lensError,
        fetchNextPage: fetchNextLensPage,
        isFetchingNextPage: isFetchingLensNextPage,
        isPending: pendingLens,
        hasNextPage: hasNextLensPage,
        isLoading: isLoadingLens,
    } = useInfiniteQuery({
        queryKey: ['social-feeds', 'lens', lensIds],
        queryFn: async ({ pageParam }) => {
            return Lens.getPostsByProfileId(lensIds, pageParam)
        },
        initialPageParam: undefined as any,
        getNextPageParam: (lastPage) => lastPage?.nextIndicator,
        select(res) {
            return res.pages.flatMap((page) => page.data)
        },
    })
    const error = farcasterError || lensError
    const feeds = sortBy([...farcasterPosts, ...lensPosts], (x) => (x.timestamp ? -x.timestamp : 0))
    const loading = isFetchingFarcasterNextPage || pendingFarcaster || isFetchingLensNextPage || pendingLens
    const isInitialLoading = isLoadingFarcaster || isLoadingLens
    const hasNextPage = hasNextFarcasterPage || hasNextLensPage

    const fetchNextPage = useCallback(() => {
        fetchNextFarcasterPage()
        fetchNextLensPage()
    }, [])

    return { error, feeds, loading, isInitialLoading, hasNextPage, fetchNextPage }
}
