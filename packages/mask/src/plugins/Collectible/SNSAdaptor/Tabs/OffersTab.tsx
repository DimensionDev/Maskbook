import { LoadingBase, makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { CollectibleTab } from '../CollectibleTab'
import { Typography, Button } from '@mui/material'
import { Icons } from '@masknet/icons'
import { CollectibleState } from '../../hooks/useCollectibleState'

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
    const _orders = orders.value?.data ?? []
    console.log(_orders, 'orders')
    return useMemo(() => {
        if (orders.loading) return <LoadingBase />
        if (orders.error || !orders.value)
            return (
                <div className={classes.body}>
                    <Typography className={classes.emptyText}>LoadFailed</Typography>
                    <Button variant="text" onClick={() => orders.retry()}>
                        retry
                    </Button>
                </div>
            )
        if (!_orders.length)
            return (
                <div className={classes.body}>
                    <Icons.EmptySimple className={classes.emptyIcon} />
                    <Typography className={classes.emptyText}>This NFT didn't get any offer</Typography>
                </div>
            )
        return (
            <CollectibleTab>
                <div className={classes.body} style={{ justifyContent: 'unset' }}>
                    <>
                        {/* {_orders?.map((x, idx) => (
                            <NFTOfferCard key={idx} offer={x} />
                        ))} */}
                    </>
                </div>
            </CollectibleTab>
        )
    }, [orders, classes])
}
