import { useMemo } from 'react'
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { LoadingBase, makeStyles } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import { useI18N } from '../../../utils'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleTab } from './CollectibleTab'
import { OrderRow } from './OrderRow'
import { CurrencyType, isOne, isZero, OrderSide, SourceType } from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            overflow: 'auto',
        },
        content: {
            padding: '0 !important',
        },
        empty: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: theme.spacing(8, 0),
        },
        emptyCell: {
            borderStyle: 'none',
            textAlign: 'center',
        },
        button: {
            marginLeft: theme.spacing(1),
        },
    }
})

export function ListingTab() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { asset, provider } = CollectibleState.useContainer()

    const orders = asset.value?.orders?.filter((x) => x.side === OrderSide.Sell) ?? EMPTY_LIST

    const isDifferenceToken = useMemo(() => {
        if (provider === SourceType.OpenSea) {
            return (
                orders.some(
                    (item) =>
                        (item.paymentToken?.symbol !== 'WETH' && item.paymentToken?.symbol !== 'ETH') ||
                        (item.quantity && !isOne(item.quantity)),
                ) && orders.filter((item) => isZero(item.expiredAt ?? 0)).length === 0
            )
        } else {
            return false
        }
    }, [provider, orders])

    const dataSource = useMemo(() => {
        if (!orders.length) return []
        return orders.sort((a, b) => {
            const current = new BigNumber(a.price?.[CurrencyType.USD] ?? 0)
            const next = new BigNumber(b.price?.[CurrencyType.USD] ?? 0)
            if (current.isLessThan(next)) return -1
            else if (current.isGreaterThan(next)) return 1
            return 0
        })
    }, [orders, asset.value])

    if (asset.loading)
        return (
            <div className={classes.empty}>
                <LoadingBase />
            </div>
        )
    if (!asset.value || asset.error || !dataSource.length)
        return (
            <>
                <Table size="small" stickyHeader>
                    <TableBody className={classes.empty}>
                        <TableRow>
                            <TableCell className={classes.emptyCell}>
                                <Typography color="textSecondary">{t('plugin_collectible_no_listings')}</Typography>
                                <Button
                                    sx={{
                                        marginTop: 1,
                                    }}
                                    variant="text"
                                    onClick={() => asset.retry()}>
                                    {t('plugin_collectible_retry')}
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </>
        )

    return (
        <CollectibleTab classes={{ root: classes.root, content: classes.content }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('plugin_collectible_from')}</TableCell>
                        {isDifferenceToken ? (
                            <>
                                <TableCell>{t('plugin_collectible_unit_price')}</TableCell>
                                <TableCell>{t('plugin_collectible_quantity')}</TableCell>
                            </>
                        ) : (
                            <>
                                <TableCell>{t('plugin_collectible_price')}</TableCell>
                                {provider === SourceType.OpenSea ? (
                                    <TableCell>{t('plugin_collectible_expiration')}</TableCell>
                                ) : null}
                            </>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataSource.map((order) => (
                        <OrderRow key={order.hash} order={order} isDifferenceToken={isDifferenceToken} />
                    ))}
                </TableBody>
            </Table>
        </CollectibleTab>
    )
}
