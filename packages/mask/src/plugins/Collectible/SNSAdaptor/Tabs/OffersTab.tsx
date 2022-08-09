import { LoadingBase, makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { CollectibleTab } from '../CollectibleTab'
import { EMPTY_LIST } from '@masknet/shared-base'
import { Typography, Button } from '@mui/material'
import { Icons } from '@masknet/icons'
import { CollectibleState } from '../../hooks/useCollectibleState'
import { NFTOfferCard } from '../../../../components/shared/NFTCard/NFTOfferCard'
import { useI18N } from '../../../../utils'

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
        color: theme.palette.maskColor.second,
    },
}))

export function OffersTab() {
    const { classes } = useStyles()
    const { orders } = CollectibleState.useContainer()
    const _orders = orders.value?.data ?? EMPTY_LIST
    const { t } = useI18N()
    return useMemo(() => {
        if (orders.loading) return <LoadingBase />
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
                    <Typography className={classes.emptyText}>{t('plugin_collectible_nft_activity_empty')}</Typography>
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
    }, [orders, classes])
}
