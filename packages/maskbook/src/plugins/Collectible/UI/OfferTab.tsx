import {
    makeStyles,
    createStyles,
    Button,
    Typography,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Skeleton,
    Box,
    TableHead,
} from '@material-ui/core'
import { OrderSide } from 'opensea-js/lib/types'
import { CollectibleState } from '../hooks/useCollectibleState'
import { useOrders } from '../hooks/useOrders'
import { CollectibleTab } from './CollectibleTab'
import { useMemo } from 'react'
import { getOrderUnitPrice } from '../utils'
import { Row } from './OrderRow'
import BigNumber from 'bignumber.js'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            overflow: 'auto',
        },
        content: {},
    })
})

export interface OfferTabProps {}

export function OfferTab(props: OfferTabProps) {
    const classes = useStyles()

    const { token } = CollectibleState.useContainer()
    const offers = useOrders(token, OrderSide.Buy)

    const isDifferenceToken = useMemo(
        () =>
            offers.value?.orders.some(
                (item) =>
                    (item.paymentTokenContract?.symbol !== 'WETH' && item.paymentTokenContract?.symbol !== 'ETH') ||
                    new BigNumber(item.quantity).toString() !== '1',
            ),
        [offers.value],
    )

    const dataSource = useMemo(() => {
        if (!offers.value || !offers.value?.orders || !offers.value?.orders.length) return []
        return offers.value.orders
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
                    return 1
                } else if (current.isGreaterThan(next)) {
                    return -1
                }
                return 0
            })
    }, [offers.value])

    if (offers.loading)
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

    if (!offers.value || offers.error || !dataSource.length)
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '16px 0',
                }}>
                <Typography color="textSecondary">No Offers</Typography>
                <Button
                    sx={{
                        marginTop: 1,
                    }}
                    variant="text"
                    onClick={() => offers.retry()}>
                    Retry
                </Button>
            </Box>
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
                        <Row key={order.hash} order={order} isDifferenceToken={isDifferenceToken} />
                    ))}
                </TableBody>
            </Table>
        </CollectibleTab>
    )
}
