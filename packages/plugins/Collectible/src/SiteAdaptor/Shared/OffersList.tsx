import { EmptyStatus, ReloadStatus, SourceProviderSwitcher } from '@masknet/shared'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NonFungibleTokenOrder } from '@masknet/web3-shared-base'
import { Box, Button, Stack } from '@mui/material'
import { useMemo } from 'react'
import { Context } from '../Context/index.js'
import { OfferCard } from './OfferCard.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 247,
        width: '100%',
        height: 247,
        justifyContent: 'center',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    card: {
        marginBottom: theme.spacing(1.5),
    },
}))

export interface OffersListProps {
    offers: Array<NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    error?: Error
    loading: boolean
    finished?: boolean
    onRetry?(): void
    onNext?(): void
}

function OffersList(props: OffersListProps) {
    const { offers, loading, finished, error, onRetry, onNext } = props

    const orderedOffers = useMemo(() => offers.sort((a, b) => (a.createdAt! > b.createdAt! ? -1 : 0)), [offers])

    const { classes } = useStyles()

    if (loading && !orderedOffers.length)
        return (
            <div className={classes.wrapper}>
                <LoadingBase />
            </div>
        )
    if (error && offers.length === 0)
        return (
            <div className={classes.wrapper}>
                <ReloadStatus onRetry={onRetry} />
            </div>
        )
    if (!orderedOffers.length)
        return (
            <EmptyStatus height={215}>
                <Trans>This NFT didn't have any offers.</Trans>
            </EmptyStatus>
        )

    return (
        <div className={classes.wrapper} style={{ justifyContent: 'unset' }} data-hide-scrollbar>
            {orderedOffers.map((x, idx) => (
                <OfferCard key={idx} offer={x} className={classes.card} />
            ))}
            <Stack pb="1px" width="100%" direction="row" justifyContent="center" data-hide-scrollbar>
                {!finished && (
                    <Button variant="roundedContained" sx={{ mb: 2 }} onClick={() => onNext?.()}>
                        <Trans>Load More</Trans>
                    </Button>
                )}
            </Stack>
        </div>
    )
}

export function OffersListWrapper(props: OffersListProps) {
    const { offers } = props
    const { setSourceType, sourceType = offers[0]?.source } = Context.useContainer()

    return (
        <div>
            {!offers.length && !sourceType ? null : (
                <Box mb={2}>
                    <SourceProviderSwitcher selected={sourceType!} onSelect={setSourceType} />
                </Box>
            )}
            <OffersList {...props} />
        </div>
    )
}
