import { useMemo } from 'react'
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils'
import { CollectibleTab } from '../CollectibleTab'
import { CollectibleState } from '../../hooks/useCollectibleState'
import { Row } from './Row'
import { TableListPagination } from '../Pagination'
import { LoadingTable } from '../LoadingTable'
import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => {
    return {
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
        emptyCell: {
            borderStyle: 'none',
        },
    }
})

export interface HistoryTabProps {}

export function HistoryTab(props: HistoryTabProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { provider, events, eventPage, setEventPage } = CollectibleState.useContainer()

    //#region If there is a different asset, the unit price and quantity should be displayed
    const isDifferenceToken = useMemo(() => {
        if (provider === NonFungibleAssetProvider.OPENSEA)
            return events.value?.some((item) => item.price?.asset?.asset_contract.symbol !== 'ETH')
        else return false
    }, [events.value, provider])
    //#endregion

    if (events.loading) return <LoadingTable />
    if (!events.value || events.error || !events.value?.length)
        return (
            <Table size="small" stickyHeader>
                <TableBody className={classes.empty}>
                    <TableRow>
                        <TableCell className={classes.emptyCell}>
                            <Typography color="textSecondary">{t('plugin_collectible_no_history')}</Typography>
                            <Button
                                sx={{
                                    marginTop: 1,
                                }}
                                variant="text"
                                onClick={() => events.retry()}>
                                {t('plugin_collectible_retry')}
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
                <TableListPagination
                    handlePrevClick={() => setEventPage((prev) => prev - 1)}
                    handleNextClick={() => setEventPage((prev) => prev + 1)}
                    prevDisabled={eventPage === 0}
                    nextDisabled={false}
                    page={eventPage}
                    pageCount={10}
                />
            </Table>
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
                    {events.value.map((order) => (
                        <Row key={order.id} event={order} isDifferenceToken={isDifferenceToken} />
                    ))}
                </TableBody>
                {(provider === NonFungibleAssetProvider.OPENSEA && events.value.length) || eventPage > 0 ? (
                    <TableListPagination
                        handlePrevClick={() => setEventPage((prev) => prev - 1)}
                        handleNextClick={() => setEventPage((prev) => prev + 1)}
                        prevDisabled={eventPage === 0}
                        nextDisabled={false}
                        page={eventPage}
                        pageCount={10}
                    />
                ) : null}
            </Table>
        </CollectibleTab>
    )
}
