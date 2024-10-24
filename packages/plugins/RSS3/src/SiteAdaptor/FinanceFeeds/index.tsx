import { Trans } from '@lingui/macro'
import { ElementAnchor, EmptyStatus, ReloadStatus } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { ScopedDomainsContainer, useReverseAddress, useWeb3Utils } from '@masknet/web3-hooks-base'
import { Box, Skeleton, Typography } from '@mui/material'
import { range } from 'lodash-es'
import { memo, useMemo, type HTMLProps } from 'react'
import { FeedOwnerContext, type FeedOwnerOptions } from '../contexts/FeedOwnerContext.js'
import { FinanceFeed } from './FinanceFeed.js'
import { useFinanceFeeds } from './useFinanceFeeds.js'

const useStyles = makeStyles()((theme) => ({
    loading: {
        color: theme.palette.maskColor.main,
    },
    skeleton: {
        borderRadius: theme.spacing(1),
    },
}))

export interface FinanceFeedsProps extends HTMLProps<HTMLDivElement> {
    address?: string
}
export const FinanceFeeds = memo<FinanceFeedsProps>(function FinanceFeeds({ address, ...rest }) {
    const { classes } = useStyles()
    const {
        error,
        data: feeds = EMPTY_LIST,
        isPending: loading,
        isLoading: isInitialLoading,
        hasNextPage,
        fetchNextPage,
    } = useFinanceFeeds({ address })

    const Utils = useWeb3Utils()
    const { data: reversedName } = useReverseAddress(undefined, address)
    const { getDomain } = ScopedDomainsContainer.useContainer()
    const name = address ? getDomain(address) || reversedName : reversedName
    const feedOwner: FeedOwnerOptions | undefined = useMemo(() => {
        if (!address) return
        return {
            address,
            name,
            ownerDisplay: name ? Utils.formatDomainName(name) : Utils.formatAddress(address, 4) ?? address,
        }
    }, [address, name, Utils.formatDomainName, Utils.formatAddress])

    if (error && !feeds.length)
        return (
            <Box p={2} boxSizing="border-box">
                <Box mt="100px" color={(theme) => theme.palette.maskColor.main}>
                    <ReloadStatus onRetry={fetchNextPage} />
                </Box>
            </Box>
        )

    if (isInitialLoading || (loading && !feeds.length) || !feedOwner) {
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
        <FeedOwnerContext value={feedOwner}>
            <div {...rest}>
                {feeds.map((tx) => (
                    <FinanceFeed key={tx.hash} transaction={tx} />
                ))}

                {hasNextPage ?
                    <ElementAnchor height={10} callback={() => fetchNextPage()}>
                        {loading ?
                            <LoadingBase className={classes.loading} />
                        :   null}
                    </ElementAnchor>
                :   <Typography color={(theme) => theme.palette.maskColor.second} textAlign="center" py={2}>
                        <Trans>No more data available.</Trans>
                    </Typography>
                }
            </div>
        </FeedOwnerContext>
    )
})
