import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleTab } from './CollectibleTab'
import { OrderRow } from './OrderRow'
import { TableListPagination } from './Pagination'
import { LoadingTable } from './LoadingTable'
import { isZero } from '@masknet/web3-shared-base'
import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm'

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
            textAlign: 'center',
        },
        button: {
            marginLeft: theme.spacing(1),
        },
    }
})

export function OfferTab() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { asset, provider, offers, offerPage, setOfferPage } = CollectibleState.useContainer()

    const isDifferenceToken = useMemo(() => {
        if (provider === NonFungibleAssetProvider.OPENSEA) {
            return (
                offers.value?.data.some(
                    (item) =>
                        (item.payment_token_contract?.symbol !== 'WETH' &&
                            item.payment_token_contract?.symbol !== 'ETH') ||
                        (item.quantity && new BigNumber(item.quantity).toString() !== '1'),
                ) && offers.value.data.filter((item) => isZero(item.expiration_time ?? 0)).length === 0
            )
        } else {
            return false
        }
    }, [provider, offers])

    const dataSource = useMemo(() => {
        if (!offers.value?.data.length) return []
        return offers.value.data
    }, [offers])

    if (asset.loading) return <LoadingTable />
    if (!offers.value?.data.length || asset.error || !dataSource.length)
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
                <TableHead>
                    <TableRow>
                        <TableCell>{t('plugin_collectible_from')}</TableCell>
                        {isDifferenceToken ? (
                            <>
                                <TableCell>{t('plugin_collectible_unit_price')}</TableCell>
                                <TableCell>{t('plugin_collectible_quantity')}</TableCell>
                            </>
                        ) : (
                            <>
                                <TableCell>{t('plugin_collectible_price')}</TableCell>
                                {provider === NonFungibleAssetProvider.OPENSEA ? (
                                    <TableCell>{t('plugin_collectible_expiration')}</TableCell>
                                ) : null}
                            </>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataSource.map((order) => (
                        <OrderRow key={order.order_hash} order={order} isDifferenceToken={isDifferenceToken} />
                    ))}
                </TableBody>
                {(provider === NonFungibleAssetProvider.OPENSEA && dataSource.length) || offerPage > 0 ? (
                    <TableListPagination
                        handlePrevClick={() => setOfferPage((prev) => prev - 1)}
                        handleNextClick={() => setOfferPage((prev) => prev + 1)}
                        prevDisabled={offerPage === 0}
                        nextDisabled={dataSource.length < 10}
                        page={offerPage}
                        pageCount={10}
                    />
                ) : null}
            </Table>
        </CollectibleTab>
    )
}
