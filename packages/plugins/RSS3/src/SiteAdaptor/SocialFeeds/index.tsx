import { Trans } from '@lingui/macro'
import { ElementAnchor, EmptyStatus, ReloadStatus } from '@masknet/shared'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Box, Skeleton, Typography } from '@mui/material'
import { range } from 'lodash-es'
import { memo, type HTMLProps } from 'react'
import { useSocialFeeds } from './useSocialFeeds.js'
import { SocialFeed } from './SocialFeed.js'

const useStyles = makeStyles()((theme) => ({
    loading: {
        color: theme.palette.maskColor.main,
    },
    skeleton: {
        borderRadius: theme.spacing(1),
    },
}))

export interface SocialFeedsProps extends HTMLProps<HTMLDivElement> {
    address?: string
    userId?: string
}
export const SocialFeeds = memo<SocialFeedsProps>(function SocialFeeds({ userId, address, ...rest }) {
    const { classes } = useStyles()
    const { error, feeds, loading, isInitialLoading, hasNextPage, fetchNextPage } = useSocialFeeds({ userId, address })

    if (error && !feeds.length)
        return (
            <Box p={2} boxSizing="border-box">
                <Box mt="100px" color={(theme) => theme.palette.maskColor.main}>
                    <ReloadStatus onRetry={fetchNextPage} />
                </Box>
            </Box>
        )

    if (isInitialLoading || (loading && !feeds.length)) {
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
        <div {...rest}>
            {feeds.map((post) => (
                <SocialFeed key={post.postId} post={post} />
            ))}

            {hasNextPage ?
                <ElementAnchor height={10} callback={fetchNextPage}>
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
