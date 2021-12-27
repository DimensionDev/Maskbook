import { useMemo } from 'react'
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useChainId } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleTab } from './CollectibleTab'
import { OrderRow } from './OrderRow'
import { LoadingTable } from './LoadingTable'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            overflow: 'auto',
        },
        content: {
            padding: '0 !important',
        },
        container: {
            padding: theme.spacing(2),
        },
        latest_bid: {
            maxWidth: 112,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        chain_row: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: theme.spacing(0.5),
            '&:last-child': {
                marginBottom: 0,
            },
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
        button: {
            marginLeft: theme.spacing(1),
        },
    }
})

export function OfferTab() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId()
    const { asset, offers } = CollectibleState.useContainer()

    const assetSource = useMemo(() => {
        if (!asset.value || asset.error) return
        return asset.value
    }, [asset.value])

    const dataSource = useMemo(() => {
        if (!offers.value || offers.error) return
        return offers.value
    }, [offers.value])

    if (offers.loading) return <LoadingTable />
    if (!offers.value || offers.error || dataSource?.history?.length <= 0)
        return (
            <Table size="small" stickyHeader>
                <TableBody className={classes.empty}>
                    <TableRow>
                        <TableCell className={classes.emptyCell}>
                            <Typography color="textSecondary">{t('plugin_collectible_no_offers')}</Typography>
                            <Button
                                sx={{
                                    marginTop: 1,
                                }}
                                variant="text"
                                onClick={() => offers.retry()}>
                                {t('plugin_collectible_retry')}
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        )

    return (
        <CollectibleTab classes={{ root: classes.root, content: classes.content }}>
            {dataSource?.trade?.latestBid > 0 ? (
                <Box className={classes.container}>
                    <Typography variant="body1" sx={{ marginBottom: 1 }}>
                        {t('plugin_cryptoartai_latest_bid')}
                    </Typography>
                    <Box className={classes.chain_row}>
                        <Typography variant="body2">
                            <strong>{t('plugin_cryptoartai_price')}</strong>
                        </Typography>
                        <Typography className={classes.latest_bid} variant="body2">
                            <strong>{(dataSource?.trade?.latestBid ?? 'Unknown') + ' Ξ'}</strong>
                        </Typography>
                    </Box>
                </Box>
            ) : null}
            {assetSource?.is24Auction && assetSource?.latestBidVo?.auctionEndTime ? (
                <Box className={classes.container}>
                    <Typography variant="body2">
                        {t('plugin_cryptoartai_auction_end_time')}
                        <strong>{assetSource?.latestBidVo?.auctionEndTime}</strong>
                    </Typography>
                </Box>
            ) : null}
            {dataSource?.history?.length > 0 ? (
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('plugin_cryptoartai_operator')}</TableCell>
                            <TableCell>{t('plugin_cryptoartai_status')}</TableCell>
                            <TableCell>{t('plugin_cryptoartai_time')}</TableCell>
                            <TableCell>{t('plugin_cryptoartai_price')}</TableCell>
                            <TableCell>{t('plugin_cryptoartai_tx')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataSource?.history?.map((order: any) => (
                            <OrderRow key={order.id} event={order} chainId={chainId} />
                        ))}
                    </TableBody>
                </Table>
            ) : null}
        </CollectibleTab>
    )
}
