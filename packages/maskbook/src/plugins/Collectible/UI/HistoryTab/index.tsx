import { useMemo, useRef, useState } from 'react'
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
import { useI18N } from '../../../../utils/i18n-next-ui'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            overflow: 'auto',
        },
        spacer: {
            flex: 0,
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

export interface HistoryTabProps {}

export function HistoryTab(props: HistoryTabProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const cursors = useRef<string[]>([])
    const [page, setPage] = useState(0)

    const { token } = CollectibleState.useContainer()
    const events = useEvents(token, cursors.current[page - 1])

    //#region If there is a different asset, the unit price and quantity should be displayed
    const isDifferenceToken = useMemo(
        () => events.value?.edges.some((item) => item.node.price?.asset.symbol !== 'ETH'),
        [events.value],
    )

    useUpdateEffect(() => {
        if (
            events.value &&
            events.value.pageInfo.endCursor &&
            !cursors.current.some((item) => events.value && item === events.value.pageInfo.endCursor)
        ) {
            cursors.current.push(events.value.pageInfo.endCursor)
        }
    }, [events, cursors])

    if (events.loading)
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
                    {new Array(10).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton animation="wave" variant="rectangular" width="100%" height={22} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell>
                            <Skeleton animation="wave" variant="rectangular" width="100%" height={46} />
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        )

    if (!events.value || events.error)
        return (
            <Box className={classes.empty}>
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
                            <Typography>{t('plugin_collectible_event')}</Typography>
                        </TableCell>
                        {isDifferenceToken ? (
                            <>
                                <TableCell>
                                    <Typography>{t('plugin_collectible_unit_price')}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>{t('plugin_collectible_quantity')}</Typography>
                                </TableCell>
                            </>
                        ) : (
                            <TableCell>
                                <Typography>{t('plugin_collectible_price')}</Typography>
                            </TableCell>
                        )}
                        <TableCell>
                            <Typography>{t('plugin_collectible_from')}</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography>{t('plugin_collectible_to')}</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography>{t('plugin_collectible_Date')}</Typography>
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
                            page={page}
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
