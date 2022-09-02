import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils'
import { CollectibleTab } from '../CollectibleTab'
import { CollectibleState } from '../../hooks/useCollectibleState'
import { Row } from './Row'
import { LoadingTable } from '../LoadingTable'

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
    }
})

export interface HistoryTabProps {}

export function HistoryTab(props: HistoryTabProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { events } = CollectibleState.useContainer()

    if (events.loading) return <LoadingTable />
    if (!events.value || events.error || !events.value?.data.length)
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
            </Table>
        )

    return (
        <CollectibleTab classes={{ root: classes.root, content: classes.content }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('plugin_cryptoartai_operator')}</TableCell>
                        <TableCell>{t('plugin_cryptoartai_activity_type')}</TableCell>
                        <TableCell>{t('plugin_cryptoartai_time')}</TableCell>
                        <TableCell>{t('plugin_cryptoartai_price')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {events.value.data.map((order: any) => (
                        <Row key={order.id} event={order} chainId={chainId} />
                    ))}
                </TableBody>
            </Table>
        </CollectibleTab>
    )
}
