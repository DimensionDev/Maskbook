import {
    Box,
    Button,
    createStyles,
    makeStyles,
    Skeleton,
    Table,
    TableBody,
    TableCell,
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
const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            overflow: 'auto',
        },
        empty: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: theme.spacing(6, 0),
        },
    })
})

export function ListingTab() {
    const classes = useStyles()
    const [page, setPage] = useState(0)
    const { token } = CollectibleState.useContainer()
    const listings = useOrders(token, OrderSide.Sell, page)

    const isDifferenceToken = useMemo(
        () =>
            listings.value?.orders.some(
                (item) =>
                    (item.paymentTokenContract?.symbol !== 'WETH' && item.paymentTokenContract?.symbol !== 'ETH') ||
                    new BigNumber(item.quantity).toString() !== '1',
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
            <Table>
                <TableBody>
                    {new Array(10).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton animation="wave" variant="rectangular" width="100%" height={30} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )

    if (!listings.value || listings.error || !dataSource.length)
        return (
            <Table>
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
        <CollectibleTab classes={{ root: classes.root }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Typography>From</Typography>
                        </TableCell>
                        {isDifferenceToken ? (
                            <>
                                <TableCell>
                                    <Typography>Unit Price</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>Quantity</Typography>
                                </TableCell>
                            </>
                        ) : (
                            <>
                                <TableCell>
                                    <Typography>Price</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>Expiration</Typography>
                                </TableCell>
                            </>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataSource.map((order) => (
                        <OrderRow key={order.hash} order={order} isDifferenceToken={isDifferenceToken} />
                    ))}
                </TableBody>
                <TableListPagination
                    handlePrevClick={() => setPage((prev) => prev - 1)}
                    handleNextClick={() => setPage((prev) => prev + 1)}
                    prevDisabled={page === 0}
                    nextDisabled={dataSource.length < 10}
                    page={page}
                    pageCount={10}
                />
            </Table>
        </CollectibleTab>
    )
}
