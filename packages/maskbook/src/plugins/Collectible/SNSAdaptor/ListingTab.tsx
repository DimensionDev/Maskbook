import { useMemo } from 'react'
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import { useI18N } from '../../../utils'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleTab } from './CollectibleTab'
import { OrderRow } from './OrderRow'
import { TableListPagination } from './Pagination'
import { CollectibleProvider } from '../types'
import { LoadingTable } from './LoadingTable'
import { isZero, useAccount } from '@masknet/web3-shared'

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
        },
        button: {
            marginLeft: theme.spacing(1),
        },
    }
})

export function ListingTab() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const account = useAccount()
    const { token, asset, provider, orders, orderPage, setOrderPage } = CollectibleState.useContainer()

    const isDifferenceToken = useMemo(() => {
        if (provider === CollectibleProvider.OPENSEA) {
            return (
                orders.value?.some(
                    (item) =>
                        (item.paymentTokenContract?.symbol !== 'WETH' && item.paymentTokenContract?.symbol !== 'ETH') ||
                        (item.quantity && new BigNumber(item.quantity).toString() !== '1'),
                ) && orders.value.filter((item) => isZero(item.expirationTime ?? 0)).length === 0
            )
        } else {
            return false
        }
    }, [provider, orders.value])

    const dataSource = useMemo(() => {
        if (!orders.value || !orders.value?.length) return []
        return orders.value.sort((a, b) => {
            const current = new BigNumber(a.unitPrice)
            const next = new BigNumber(b.unitPrice)
            if (current.isLessThan(next)) return -1
            else if (current.isGreaterThan(next)) return 1
            return 0
        })
    }, [orders.value])

    if (orders.loading) return <LoadingTable />
    if (!orders.value || orders.error || !dataSource.length)
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
                                    onClick={() => orders.retry()}>
                                    {t('plugin_collectible_retry')}
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                    <TableListPagination
                        handlePrevClick={() => setOrderPage((prev) => prev - 1)}
                        handleNextClick={() => setOrderPage((prev) => prev + 1)}
                        prevDisabled={orderPage === 0}
                        nextDisabled={dataSource.length < 10}
                        page={orderPage}
                        pageCount={10}
                    />
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
                                <TableCell>{t('plugin_collectible_expiration')}</TableCell>
                            </>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataSource.map((order) => (
                        <OrderRow key={order.hash} order={order} isDifferenceToken={isDifferenceToken} />
                    ))}
                </TableBody>
                {(provider === CollectibleProvider.OPENSEA && dataSource.length) || orderPage > 0 ? (
                    <TableListPagination
                        handlePrevClick={() => setOrderPage((prev) => prev - 1)}
                        handleNextClick={() => setOrderPage((prev) => prev + 1)}
                        prevDisabled={orderPage === 0}
                        nextDisabled={dataSource.length < 10}
                        page={orderPage}
                        pageCount={10}
                    />
                ) : null}
            </Table>
        </CollectibleTab>
    )
}
