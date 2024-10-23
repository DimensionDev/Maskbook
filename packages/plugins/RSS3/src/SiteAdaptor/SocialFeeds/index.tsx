import { EMPTY_LIST } from '@masknet/shared-base'
import { useFireflyFarcasterAccounts, useFireflyLensAccounts } from '@masknet/web3-hooks-base'
import { FireflyFarcaster, Lens } from '@masknet/web3-providers'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { memo } from 'react'
import { SocialFeed } from './SocialFeed.js'
import { Box, Skeleton, Typography } from '@mui/material'
import { ElementAnchor, EmptyStatus, ReloadStatus } from '@masknet/shared'
import { range, sortBy } from 'lodash-es'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    loading: {
        color: theme.palette.maskColor.main,
    },
    skeleton: {
        borderRadius: theme.spacing(1),
    },
}))

interface Props {
    address: string | undefined
    userId: string | undefined
}
export const SocialFeeds = memo<Props>(function SocialFeeds({ userId }) {
    const { classes } = useStyles()
    const { data: farcasterAccounts = EMPTY_LIST } = useFireflyFarcasterAccounts(userId)
    const { data: lensAccounts = EMPTY_LIST } = useFireflyLensAccounts(userId, true)

    const lensHandles = lensAccounts.map((x) => x.handle)
    const { data: lensIds = EMPTY_LIST } = useQuery({
        queryKey: ['lens', 'popup-list', lensHandles],
        queryFn: async () => {
            const profiles = await Lens.getProfilesByHandles(lensHandles)
            return profiles.map((x) => x.id)
        },
    })
    const fids = farcasterAccounts.map((x) => x.id.toString())
    console.log({ lensAccounts, lensIds })

    const {
        data: farcasterPosts = EMPTY_LIST,
        error: farcasterError,
        fetchNextPage: fetchNextFarcasterPage,
        isFetchingNextPage: isFetchingFarcasterNextPage,
        isPending: loadingFarcasterFeeds,
        hasNextPage: hasNextFarcasterPage,
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

    const {
        data: lensPosts = EMPTY_LIST,
        error: lensError,
        fetchNextPage: fetchNextLensPage,
        isFetchingNextPage: isFetchingLensNextPage,
        isPending: loadingLensFeeds,
        hasNextPage: hasNextLensPage,
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
    console.log({ hasNextPage: hasNextFarcasterPage, isFetchingFarcasterNextPage, farcasterError, lensError })
    const feeds = sortBy([...farcasterPosts, ...lensPosts], (x) => (x.timestamp ? -x.timestamp : 0))
    const loading = isFetchingFarcasterNextPage || loadingFarcasterFeeds || isFetchingLensNextPage || loadingLensFeeds
    const hasNextPage = hasNextFarcasterPage || hasNextLensPage
    console.log({ farcasterPosts, lensPosts })

    if (error && !feeds.length)
        return (
            <Box p={2} boxSizing="border-box">
                <Box mt="100px" color={(theme) => theme.palette.maskColor.main}>
                    <ReloadStatus onRetry={fetchNextFarcasterPage} />
                </Box>
            </Box>
        )

    if (loading && !feeds.length) {
        return (
            <Box p={2} boxSizing="border-box">
                {range(3).map((i) => (
                    <Box mb={1} key={i}>
                        <Skeleton animation="wave" variant="rectangular" height={90} className={classes.skeleton} />
                    </Box>
                ))}
            </Box>
        )
    }
    if (!feeds?.length && !loading) {
        return (
            <EmptyStatus height={260}>
                <Trans>There's no feed associated with this address.</Trans>
            </EmptyStatus>
        )
    }
    return (
        <div>
            {feeds.map((post) => (
                <SocialFeed key={post.postId} post={post} />
            ))}

            {hasNextPage ?
                <ElementAnchor
                    height={10}
                    callback={() => {
                        fetchNextFarcasterPage()
                        fetchNextLensPage()
                    }}>
                    {loading ?
                        <LoadingBase className={classes.loading} />
                    :   null}
                </ElementAnchor>
            :   <Typography color={(theme) => theme.palette.maskColor.second} textAlign="center" py={2}>
                    <Trans>No more data available.</Trans>
                </Typography>
            }
        </div>
    )
})
