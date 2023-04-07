import { Typography, Button, Box, Stack } from '@mui/material'
import { makeStyles, LoadingBase } from '@masknet/theme'
import type { NonFungibleTokenOrder } from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import type { Web3Helper } from '@masknet/web3-helpers'
import { OfferCard } from './OfferCard.js'
import { useI18N } from '../../locales/i18n_generated.js'
import { SourceProviderSwitcher, RetryHint } from '@masknet/shared'
import { Context } from '../Context/index.js'
import type { AsyncStatePageable } from '@masknet/web3-hooks-base'
import { useMemo } from 'react'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 247,
        width: '100%',
        gap: 12,
        height: 247,
        justifyContent: 'center',
    },
    emptyIcon: {
        width: 36,
        height: 36,
    },
    emptyText: {
        color: theme.palette.maskColor.publicSecond,
    },
}))

export interface OffersListProps {
    offers: AsyncStatePageable<NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
}

export function OffersList(props: OffersListProps) {
    const { offers } = props

    const _offers = useMemo(
        () =>
            (offers.value ?? EMPTY_LIST).sort((a, b) => {
                return a.createdAt! > b.createdAt! ? -1 : 0
            }),
        [offers.value],
    )

    const { classes } = useStyles()
    const t = useI18N()

    if (offers.loading && !_offers.length)
        return (
            <div className={classes.wrapper}>
                <LoadingBase />
            </div>
        )
    if (offers.error || !offers.value)
        return (
            <div className={classes.wrapper}>
                <RetryHint
                    ButtonProps={{ startIcon: <Icons.Restore color="white" size={18} />, sx: { width: 256 } }}
                    retry={() => offers.retry()}
                />
            </div>
        )
    if (!_offers.length)
        return (
            <div className={classes.wrapper}>
                <Icons.EmptySimple className={classes.emptyIcon} />
                <Typography className={classes.emptyText}>{t.plugin_collectible_nft_offers_empty()}</Typography>
            </div>
        )
    return (
        <div className={classes.wrapper} style={{ justifyContent: 'unset' }}>
            {_offers?.map((x, idx) => (
                <OfferCard key={idx} offer={x} />
            ))}
            <Stack pb="1px" width="100%" direction="row" justifyContent="center">
                {!offers.ended && (
                    <Button variant="roundedContained" sx={{ mb: 2 }} onClick={() => offers.next()}>
                        {t.load_more()}
                    </Button>
                )}
            </Stack>
        </div>
    )
}

export function OffersListWrapper(props: OffersListProps) {
    const { setSourceType, sourceType: sourceType_ } = Context.useContainer()
    const sourceType = sourceType_ ?? props.offers.value[0]?.source
    return (
        <div>
            {!props.offers.value.length && !sourceType ? null : (
                <Box mb={2}>
                    <SourceProviderSwitcher selected={sourceType!} onSelect={setSourceType} />
                </Box>
            )}
            <OffersList offers={props.offers} />
        </div>
    )
}
