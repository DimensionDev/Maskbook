import {
    makeStyles,
    createStyles,
    Typography,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Skeleton,
    Box,
    Button,
    TableHead,
    TableFooter,
    TablePagination,
    IconButton,
} from '@material-ui/core'
import { CollectibleTab } from '../CollectibleTab'
import { CollectibleState } from '../../hooks/useCollectibleState'
import { Row } from './Row'
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons'
import { useOrders } from '../../hooks/useOrders'
import { useState } from 'react'
import { useUpdateEffect } from 'react-use'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            overflow: 'auto',
        },
        pagination: {
            display: 'flex',
        },
        spacer: {
            flex: 0,
        },
    })
})

export interface HistoryTabProps {}

export function HistoryTab(props: HistoryTabProps) {
    const classes = useStyles()

    const [cursors, setCursors] = useState<string[]>([])
    const [page, setPage] = useState(0)

    const { token } = CollectibleState.useContainer()
    const orders = useOrders(token, cursors[page - 1])

    //#region If there is a different asset, the unit price and quantity should be displayed
    const isDifferenceToken = orders.value?.edges.some((item) => item.node.price?.asset.symbol !== 'ETH')

    useUpdateEffect(() => {
        if (
            orders.value &&
            orders.value.pageInfo.endCursor &&
            !cursors.some((item) => orders.value && item === orders.value.pageInfo.endCursor)
        ) {
            setCursors((prev) => (orders.value ? [...prev, orders.value.pageInfo.endCursor] : prev))
        }
    }, [orders, cursors])

    if (orders.loading)
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

    if (!orders.value || orders.error)
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                }}>
                <Typography color="textSecondary">No History</Typography>
                <Button
                    sx={{
                        marginTop: 1,
                    }}
                    variant="text"
                    onClick={() => orders.retry()}>
                    Retry
                </Button>
            </Box>
        )

    return (
        <CollectibleTab classes={{ root: classes.root }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Event</TableCell>
                        {isDifferenceToken ? (
                            <>
                                <TableCell>Unit Price</TableCell>
                                <TableCell>Quantity</TableCell>
                            </>
                        ) : (
                            <TableCell>Price</TableCell>
                        )}
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                        <TableCell>Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.value.edges.map((order) => (
                        <Row key={order.node.id} order={order} isDifferenceToken={isDifferenceToken} />
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPage={10}
                            rowsPerPageOptions={[10]}
                            count={-1}
                            page={0}
                            classes={{ spacer: classes.spacer }}
                            onPageChange={() => {}}
                            labelDisplayedRows={() => null}
                            ActionsComponent={() => {
                                return (
                                    <div>
                                        <IconButton disabled={page === 0} onClick={() => setPage((prev) => prev - 1)}>
                                            <KeyboardArrowLeft />
                                        </IconButton>
                                        <IconButton
                                            disabled={!orders.value.pageInfo.hasNextPage}
                                            onClick={() => setPage((prev) => prev + 1)}>
                                            <KeyboardArrowRight />
                                        </IconButton>
                                    </div>
                                )
                            }}
                        />
                    </TableRow>
                </TableFooter>
            </Table>
        </CollectibleTab>
    )
}
