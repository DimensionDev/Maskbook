import type { Plugin } from '@masknet/plugin-infra'
import { ElementAnchor, EmptyStatus, ReloadStatus } from '@masknet/shared'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { ScopedDomainsContainer, useReverseAddress, useWeb3Utils } from '@masknet/web3-hooks-base'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { Box, ClickAwayListener, Skeleton, Typography, type BoxProps } from '@mui/material'
import { range } from 'lodash-es'
import { memo, useMemo } from 'react'
import { useRSS3Trans } from '../locales/index.js'
import { FeedCard } from './components/index.js'
import { FeedOwnerContext, type FeedOwnerOptions } from './contexts/index.js'
import { useIsFiltersOpen } from './emitter.js'
import { FeedFilters } from './FeedFilters.js'
import { useFilters } from './filters.js'
import { useFeeds } from './hooks/useFeeds.js'
import { Networks } from '../constants.js'

const useStyles = makeStyles()((theme) => ({
    feedCard: {
        padding: theme.spacing(1.5),
    },
    switchButton: {
        textDecoration: 'underline',
        cursor: 'pointer',
    },
    loading: {
        color: theme.palette.maskColor.main,
    },
    skeleton: {
        borderRadius: theme.spacing(1),
    },
}))

export interface FeedListProps {
    listProps?: BoxProps
    address?: string
    tags?: RSS3BaseAPI.Tag[]
}

export const FeedList = memo(function FeedList({ address, tags, listProps }: FeedListProps) {
    const t = useRSS3Trans()
    const { classes } = useStyles()
    const Utils = useWeb3Utils()

    const [{ networks, isDirect }, setFilters] = useFilters()
    const {
        data: feeds,
        isPending: loadingFeeds,
        isFetchingNextPage,
        hasNextPage,
        error,
        fetchNextPage,
    } = useFeeds(address, {
        tag: tags,
        network:
            // passing all networks returns different results from omitting
            // network parameter (it's strange indeed). so we need to omit it
            // when all networks are selected
            networks.length === 0 ? []
            : networks.length === Networks.length ? undefined
            : networks,
        direction: isDirect ? 'out' : undefined,
    })

    const { data: reversedName, isPending: loadingENS } = useReverseAddress(undefined, address)
    const { getDomain } = ScopedDomainsContainer.useContainer()

    const loading = isFetchingNextPage || loadingFeeds || loadingENS

    const name = address ? getDomain(address) || reversedName : reversedName
    const feedOwner: FeedOwnerOptions | undefined = useMemo(() => {
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
                        <Skeleton animation="wave" variant="rectangular" height={90} className={classes.skeleton} />
                    </Box>
                ))}
            </Box>
        )
    }
    if (!feeds?.length && !loading) {
        return (
            <EmptyStatus height={260}>
                {t.no_data({ context: 'activities' })}{' '}
                <span
                    className={classes.switchButton}
                    role="button"
                    onClick={() => {
                        setFilters((filters) => ({
                            ...filters,
                            isDirect: !filters.isDirect,
                        }))
                    }}>
                    {isDirect ? 'View related' : 'View direct'}
                </span>
            </EmptyStatus>
        )
    }

    return (
        <FeedOwnerContext value={feedOwner}>
            {/* padding for profile card footer */}
            <Box paddingBottom="48px" {...listProps}>
                {feeds.map((feed, index) => (
                    <FeedCard key={index} className={classes.feedCard} feed={feed} />
                ))}
                {hasNextPage ?
                    <ElementAnchor callback={() => fetchNextPage()}>
                        {loading ?
                            <LoadingBase className={classes.loading} />
                        :   null}
                    </ElementAnchor>
                :   <Typography color={(theme) => theme.palette.maskColor.second} textAlign="center" py={2}>
                        {t.no_more_data()}
                    </Typography>
                }
            </Box>
        </FeedOwnerContext>
    )
})

export interface FeedsPageProps extends FeedListProps, BoxProps {
    listProps?: BoxProps
    slot: Plugin.SiteAdaptor.ProfileTabSlot
}

export const FeedsPage = memo<FeedsPageProps>(function FeedsPage({ address, tags, listProps, slot, ...rest }) {
    const [open, setOpen] = useIsFiltersOpen(slot)

    return (
        <Box position="relative" {...rest}>
            {open ?
                <ClickAwayListener
                    onClickAway={() => {
                        setOpen(false)
                    }}>
                    <FeedFilters position="absolute" zIndex={50} top={0} left={0} right={0} />
                </ClickAwayListener>
            :   null}
            <FeedList address={address} tags={tags} listProps={listProps} />
        </Box>
    )
})
