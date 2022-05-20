import { useMemo } from 'react'
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils'
import { CollectibleTab } from '../CollectibleTab'
import { CollectibleState } from '../../hooks/useCollectibleState'
import { Row } from './Row'
import { LoadingAnimation } from '@masknet/shared'
import { SourceType } from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            overflow: 'auto',
        },
        head: {
            wordBreak: 'keep-all',
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
    const { asset, provider } = CollectibleState.useContainer()

    const events = asset.value?.events ?? EMPTY_LIST

    // #region If there is a different asset, the unit price and quantity should be displayed
    const isDifferenceToken = useMemo(() => {
        if (provider === SourceType.OpenSea) return events.some((item) => item.paymentToken?.symbol !== 'ETH')
        else return false
    }, [events, provider])
    // #endregion

    if (asset.loading)
        return (
            <div className={classes.empty}>
                <LoadingAnimation />
            </div>
        )
    if (!!events.length)
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
                                onClick={() => asset.retry()}>
                                {t('plugin_collectible_retry')}
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        )

    return (
        <CollectibleTab classes={{ root: classes.root, content: classes.content }}>
            <Table size="small" stickyHeader>
                <TableHead className={classes.head}>
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
                    {events.map((event) => (
                        <Row key={event.id} event={event} isDifferenceToken={isDifferenceToken} />
                    ))}
                </TableBody>
            </Table>
        </CollectibleTab>
    )
}
