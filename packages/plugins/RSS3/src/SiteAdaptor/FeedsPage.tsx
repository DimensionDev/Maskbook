import { memo, useEffect, useMemo, useState } from 'react'
import { range } from 'lodash-es'
import { ElementAnchor, EmptyStatus, ReloadStatus } from '@masknet/shared'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { ScopedDomainsContainer, useReverseAddress, useWeb3Utils } from '@masknet/web3-hooks-base'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Box, ClickAwayListener, Skeleton } from '@mui/material'
import { useRSS3Trans } from '../locales/index.js'
import { FeedCard } from './components/index.js'
import { FeedOwnerContext, type FeedOwnerOptions } from './contexts/index.js'
import { useFeeds } from './hooks/useFeeds.js'
import { FeedFilters } from './FeedFilters.js'
import { useFilters } from './filters.js'
import { Networks } from '../constants.js'
import { emitter } from './emitter.js'

const useStyles = makeStyles()((theme) => ({
    feedCard: {
        padding: theme.spacing(1.5),
    },
    loading: {
        color: theme.palette.maskColor.main,
    },
    skeleton: {
        borderRadius: theme.spacing(1),
    },
}))

export interface FeedPageProps {
    address?: string
    tags?: RSS3BaseAPI.Tag[]
}

export const FeedList = memo(function FeedList({ address, tags }: FeedPageProps) {
    const t = useRSS3Trans()
    const { classes } = useStyles()
    const Utils = useWeb3Utils()

    const [{ networks, isDirect }] = useFilters()
    const {
        data: feeds,
        isPending: loadingFeeds,
        error,
        fetchNextPage,
    } = useFeeds(address, {
        tag: tags,
        network: networks.length === Networks.length ? undefined : networks,
        direction: isDirect ? 'out' : undefined,
    })

    const { data: reversedName, isPending: loadingENS } = useReverseAddress(undefined, address)
    const { getDomain } = ScopedDomainsContainer.useContainer()

    const loading = loadingFeeds || loadingENS

    const name = address ? getDomain(address) || reversedName : reversedName
    const feedOwner = useMemo((): FeedOwnerOptions | undefined => {
        if (!address) return
        return {
            address,
            name,
            ownerDisplay: name ? Utils.formatDomainName(name) : Utils.formatAddress(address, 4) ?? address,
        }
    }, [address, name, Utils.formatDomainName, Utils.formatAddress])

    if (error && !feeds?.length)
        return (
            <Box p={2} boxSizing="border-box">
                <Box mt="100px" color={(theme) => theme.palette.maskColor.main}>
                    <ReloadStatus onRetry={fetchNextPage} />
                </Box>
            </Box>
        )

    if ((loading && !feeds?.length) || !feedOwner) {
        return (
            <Box p={2} boxSizing="border-box">
                {range(3).map((i) => (
                    <Box mb={1} key={i}>
                        <Skeleton animation="wave" variant="rectangular" height={120} className={classes.skeleton} />
                    </Box>
                ))}
            </Box>
        )
    }
    if (!feeds?.length && !loading) {
        return <EmptyStatus height={260}>{t.no_data({ context: 'activities' })}</EmptyStatus>
    }

    return (
        <FeedOwnerContext.Provider value={feedOwner}>
            {/* padding for profile card footer */}
            <Box paddingBottom="48px">
                {feeds?.map((feed, index) => <FeedCard key={index} className={classes.feedCard} feed={feed} />)}
                <ElementAnchor callback={() => fetchNextPage()}>
                    {loading ?
                        <LoadingBase className={classes.loading} />
                    :   null}
                </ElementAnchor>
            </Box>
        </FeedOwnerContext.Provider>
    )
})

export const FeedsPage = memo<FeedPageProps>(function FeedsPage(props) {
    const [open, setOpen] = useState(false)
    useEffect(() => {
        const unsubscribe = emitter.on('toggle-filter', () => {
            setOpen((v) => !v)
        })
        return () => {
            unsubscribe()
        }
    }, [])

    return (
        <Box position="relative">
            {open ?
                <ClickAwayListener
                    onClickAway={() => {
                        setOpen(false)
                    }}>
                    <FeedFilters position="absolute" zIndex={50} top={0} left={0} right={0} />
                </ClickAwayListener>
            :   null}
            <FeedList {...props} />
        </Box>
    )
})
