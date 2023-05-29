import { memo, useMemo } from 'react'
import { range } from 'lodash-es'
import { ElementAnchor, EmptyStatus, RetryHint } from '@masknet/shared'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { ScopedDomainsContainer, useReverseAddress, useWeb3Others } from '@masknet/web3-hooks-base'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Box, Skeleton } from '@mui/material'
import { useI18N } from '../locales/index.js'
import { FeedCard } from './components/index.js'
import { FeedDetailsProvider } from './contexts/FeedDetails.js'
import { FeedOwnerContext, type FeedOwnerOptions } from './contexts/index.js'
import { useFeeds } from './hooks/useFeeds.js'

const useStyles = makeStyles()((theme) => ({
    feedCard: {
        padding: theme.spacing(2, 2, 1),
    },
    loading: {
        color: theme.palette.maskColor.main,
    },
}))

export interface FeedPageProps {
    address?: string
    tag?: RSS3BaseAPI.Tag.Donation | RSS3BaseAPI.Tag.Social
}

export const FeedsPage = memo(function FeedsPage({ address, tag }: FeedPageProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const Others = useWeb3Others()

    const { feeds, loading: loadingFeeds, error, next } = useFeeds(address, tag)

    const { data: reversedName, isLoading: loadingENS } = useReverseAddress(undefined, address)
    const { getDomain } = ScopedDomainsContainer.useContainer()

    const loading = loadingFeeds || loadingENS

    const name = address ? getDomain(address) || reversedName : reversedName
    const feedOwner = useMemo((): FeedOwnerOptions | undefined => {
        if (!address) return
        return {
            address,
            name,
            ownerDisplay: name ? Others.formatDomainName(name) : Others.formatAddress(address, 4) ?? address,
        }
    }, [address, name, Others.formatDomainName])

    if (error && !feeds.length)
        return (
            <Box p={2} boxSizing="border-box">
                <Box mt="100px" color={(theme) => theme.palette.maskColor.main}>
                    <RetryHint retry={next} />
                </Box>
            </Box>
        )

    if ((loading && !feeds.length) || !feedOwner) {
        return (
            <Box p={2} boxSizing="border-box">
                {range(3).map((i) => (
                    <Box mb={2} key={i}>
                        <Skeleton animation="wave" variant="rectangular" height={125} />
                    </Box>
                ))}
            </Box>
        )
    }
    if (!feeds.length && !loading) {
        const context = tag ? tag : 'activities'
        return <EmptyStatus>{t.no_data({ context })}</EmptyStatus>
    }

    return (
        <FeedOwnerContext.Provider value={feedOwner}>
            <FeedDetailsProvider>
                {/* padding for profile card footer */}
                <Box paddingBottom="48px">
                    {feeds.map((feed, index) => (
                        <FeedCard key={index} className={classes.feedCard} feed={feed} />
                    ))}
                    <ElementAnchor callback={() => next()}>
                        {loading ? <LoadingBase className={classes.loading} /> : null}
                    </ElementAnchor>
                </Box>
            </FeedDetailsProvider>
        </FeedOwnerContext.Provider>
    )
})
