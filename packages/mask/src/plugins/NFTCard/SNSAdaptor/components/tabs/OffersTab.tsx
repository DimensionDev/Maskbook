import { makeStyles, LoadingBase } from '@masknet/theme'
import type { NonFungibleTokenOrder, Pageable } from '@masknet/web3-shared-base'
import { Typography, Button } from '@mui/material'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { Icons } from '@masknet/icons'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { NFTOfferCard } from '../NFTOfferCard.js'
import { useI18N } from '../../../../../utils/index.js'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 300,
        width: '100%',
        gap: 12,
        justifyContent: 'center',
    },
    emptyIcon: {
        width: 36,
        height: 36,
    },
    emptyText: {
        fontSize: 14,
        color: theme.palette.maskColor.publicSecond,
    },
}))

export interface OffersTabProps {
    offers: AsyncStateRetry<Pageable<NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>>
}

export function OffersTab(props: OffersTabProps) {
    const { offers } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    const _offers = offers.value?.data ?? EMPTY_LIST
    if (offers.loading)
        return (
            <div className={classes.wrapper}>
                <LoadingBase />
            </div>
        )
    if (offers.error || !offers.value)
        return (
            <div className={classes.wrapper}>
                <Typography className={classes.emptyText}>{t('plugin_furucombo_load_failed')}</Typography>
                <Button variant="text" onClick={() => offers.retry()}>
                    {t('retry')}
                </Button>
            </div>
        )
    if (!_offers.length)
        return (
            <div className={classes.wrapper}>
                <Icons.EmptySimple className={classes.emptyIcon} />
                <Typography className={classes.emptyText}>{t('plugin_collectible_nft_offers_empty')}</Typography>
            </div>
        )
    return (
        <div className={classes.wrapper} style={{ justifyContent: 'unset' }}>
            {_offers?.map((x, idx) => (
                <NFTOfferCard key={idx} offer={x} />
            ))}
        </div>
    )
}
