import { memo } from 'react'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { CollectibleTab } from '../CollectibleTab.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import { Typography, Button } from '@mui/material'
import { Icons } from '@masknet/icons'
import { CollectibleState } from '../../hooks/useCollectibleState.js'
import { NFTOfferCard } from '../../../../components/shared/NFTCard/NFTOfferCard.js'
import { useI18N } from '../../../../utils/index.js'

const useStyles = makeStyles()((theme) => ({
    body: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 300,
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

export const OffersTab = memo(() => {
    const { classes } = useStyles()
    const { orders } = CollectibleState.useContainer()
    const _orders = orders.value?.data ?? EMPTY_LIST

    const { t } = useI18N()
    if (orders.loading)
        return (
            <div className={classes.body}>
                <LoadingBase />
            </div>
        )
    if (orders.error || !orders.value)
        return (
            <div className={classes.body}>
                <Typography className={classes.emptyText}>{t('plugin_furucombo_load_failed')}</Typography>
                <Button variant="text" onClick={() => orders.retry()}>
                    {t('retry')}
                </Button>
            </div>
        )
    if (!_orders.length)
        return (
            <div className={classes.body}>
                <Icons.EmptySimple className={classes.emptyIcon} />
                <Typography className={classes.emptyText}>{t('plugin_collectible_nft_offers_empty')}</Typography>
            </div>
        )
    return (
        <CollectibleTab>
            <div className={classes.body} style={{ justifyContent: 'unset' }}>
                {_orders?.map((x, idx) => (
                    <NFTOfferCard key={idx} offer={x} />
                ))}
            </div>
        </CollectibleTab>
    )
})
