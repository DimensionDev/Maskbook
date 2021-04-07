import { useState } from 'react'
import { useUpdateEffect } from 'react-use'
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
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons'
import { CollectibleTab } from '../CollectibleTab'
import { CollectibleState } from '../../hooks/useCollectibleState'
import { Row } from './Row'
import { useEvents } from '../../hooks/useEvents'

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
    const events = useEvents(token, cursors[page - 1])

    //#region If there is a different asset, the unit price and quantity should be displayed
    const isDifferenceToken = events.value?.edges.some((item) => item.node.price?.asset.symbol !== 'ETH')

    useUpdateEffect(() => {
        if (
            events.value &&
            events.value.pageInfo.endCursor &&
            !cursors.some((item) => events.value && item === events.value.pageInfo.endCursor)
        ) {
            setCursors((prev) => (events.value ? [...prev, events.value.pageInfo.endCursor] : prev))
        }
    }, [events, cursors])

    if (events.loading)
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

    if (!events.value || events.error)
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
                    onClick={() => events.retry()}>
                    Retry
                </Button>
            </Box>
        )

    return (
        <CollectibleTab classes={{ root: classes.root }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Typography>Event</Typography>
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
                            <TableCell>
                                <Typography>Price</Typography>
                            </TableCell>
                        )}
                        <TableCell>
                            <Typography>From</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography>To</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography>Date</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {events.value.edges.map((order) => (
                        <Row key={order.node.id} event={order} isDifferenceToken={isDifferenceToken} />
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
                                            disabled={!events.value.pageInfo.hasNextPage}
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
