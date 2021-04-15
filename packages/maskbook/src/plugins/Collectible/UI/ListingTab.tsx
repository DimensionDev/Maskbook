import {
    Box,
    Button,
    createStyles,
    makeStyles,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableRow,
    Typography,
} from '@material-ui/core'
import { useOrders } from '../hooks/useOrders'
import { OrderSide } from 'opensea-js/lib/types'
import { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleTab } from './CollectibleTab'
import { getOrderUnitPrice } from '../utils'
import { OrderRow } from './OrderRow'
import { TableListPagination } from './Pagination'
import { useI18N } from '../../../utils/i18n-next-ui'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
const useStyles = makeStyles((theme) => {
    return createStyles({
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
            padding: theme.spacing(6, 0),
        },
        button: {
            marginLeft: theme.spacing(1),
        },
    })
})

export function ListingTab() {
    const { t } = useI18N()
    const classes = useStyles()
    const [page, setPage] = useState(0)
    const { token } = CollectibleState.useContainer()
    const listings = useOrders(token, OrderSide.Sell, page)

    const isDifferenceToken = useMemo(
        () =>
            listings.value?.orders.some(
                (item) =>
                    (item.paymentTokenContract?.symbol !== 'WETH' && item.paymentTokenContract?.symbol !== 'ETH') ||
                    new BigNumber(item.quantity).toString() !== '1' ||
                    new BigNumber(item.expirationTime).isZero(),
            ),
        [listings.value],
    )

    const dataSource = useMemo(() => {
        if (!listings.value || !listings.value?.orders || !listings.value?.orders.length) return []
        return listings.value.orders
            .map((order) => {
                const unitPrice = new BigNumber(getOrderUnitPrice(order) ?? 0).toNumber()
                return {
                    ...order,
                    unitPrice,
                }
            })
            .sort((a, b) => {
                const current = new BigNumber(a.unitPrice)
                const next = new BigNumber(b.unitPrice)
                if (current.isLessThan(next)) {
                    return -1
                } else if (current.isGreaterThan(next)) {
                    return 1
                }
                return 0
            })
    }, [listings.value])

    if (listings.loading)
        return (
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Skeleton animation="wave" variant="rectangular" width="100%" height={22} />
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {new Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton animation="wave" variant="rectangular" width="100%" height={14} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell>
                            <Skeleton animation="wave" variant="rectangular" width="100%" height={28} />
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        )

    if (!listings.value || listings.error || !dataSource.length)
        return (
            <Table size="small" stickyHeader>
                <Box className={classes.empty}>
                    <Typography color="textSecondary">No Listings</Typography>
                    <Button
                        sx={{
                            marginTop: 1,
                        }}
                        variant="text"
                        onClick={() => listings.retry()}>
                        Retry
                    </Button>
                </Box>
                <TableListPagination
                    handlePrevClick={() => setPage((prev) => prev - 1)}
                    handleNextClick={() => setPage((prev) => prev + 1)}
                    prevDisabled={page === 0}
                    nextDisabled={dataSource.length < 10}
                    page={page}
                    pageCount={10}
                />
            </Table>
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
                {dataSource.length || page > 0 ? (
                    <TableListPagination
                        handlePrevClick={() => setPage((prev) => prev - 1)}
                        handleNextClick={() => setPage((prev) => prev + 1)}
                        prevDisabled={page === 0}
                        nextDisabled={dataSource.length < 10}
                        page={page}
                        pageCount={10}
                    />
                ) : null}
            </Table>
            <Box sx={{ padding: 2 }} display="flex" justifyContent="flex-end">
                {/* <ActionButton className={classes.button} variant="outlined">Cancel Listing</ActionButton>
                <ActionButton className={classes.button} color="primary" variant="contained">Price Drop</ActionButton> */}
                <ActionButton className={classes.button} color="primary" variant="contained">
                    Sell
                </ActionButton>
            </Box>
        </CollectibleTab>
    )
}
