import { useMemo, useRef, useState } from 'react'
import { useUpdateEffect } from 'react-use'
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
import { CollectibleTab } from '../CollectibleTab'
import { CollectibleState } from '../../hooks/useCollectibleState'
import { Row } from './Row'
import { useEvents } from '../../hooks/useEvents'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { CollectibleProvider } from '../../types'
import { TableListPagination } from '../Pagination'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            overflow: 'auto',
        },
        content: {
            padding: '0 !important',
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
            padding: theme.spacing(8, 0),
        },
    })
})

export interface HistoryTabProps {}

export function HistoryTab(props: HistoryTabProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const cursors = useRef<string[]>([])
    const [page, setPage] = useState(0)

    const { provider } = CollectibleState.useContainer()
    const events = useEvents(cursors.current[page - 1])

    //#region If there is a different asset, the unit price and quantity should be displayed
    const isDifferenceToken = useMemo(() => {
        if (provider === CollectibleProvider.OPENSEA)
            return events.value?.data.some((item) => item.price?.asset?.symbol !== 'ETH')
        else return false
    }, [events.value, provider])

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

    if (!events.value || events.error)
        return (
            <Box className={classes.empty}>
                <Typography color="textSecondary">{t('plugin_collectible_no_history')}</Typography>
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
        <CollectibleTab classes={{ root: classes.root, content: classes.content }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('plugin_collectible_event')}</TableCell>
                        {isDifferenceToken ? (
                            <>
                                <TableCell>{t('plugin_collectible_unit_price')}</TableCell>
                                <TableCell>{t('plugin_collectible_quantity')}</TableCell>
                            </>
                        ) : (
                            <TableCell>{t('plugin_collectible_price')}</TableCell>
                        )}
                        <TableCell>{t('plugin_collectible_from')}</TableCell>
                        <TableCell>{t('plugin_collectible_to')}</TableCell>
                        <TableCell>{t('plugin_collectible_date')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {events.value.data.map((order) => (
                        <Row key={order.id} event={order} isDifferenceToken={isDifferenceToken} />
                    ))}
                </TableBody>
                {(provider === CollectibleProvider.OPENSEA && events.value.data.length) || page > 0 ? (
                    <TableListPagination
                        handlePrevClick={() => setPage((prev) => prev - 1)}
                        handleNextClick={() => setPage((prev) => prev + 1)}
                        prevDisabled={page === 0}
                        nextDisabled={!events.value.pageInfo.hasNextPage}
                        page={page}
                        pageCount={10}
                    />
                ) : null}
            </Table>
        </CollectibleTab>
    )
}
