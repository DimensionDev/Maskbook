import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleTab } from './CollectibleTab'
import { OrderRow } from './OrderRow'
import { TableListPagination } from './Pagination'
import { CollectibleProvider } from '../types'
import { LoadingTable } from './LoadingTable'
import { isZero, useAccount } from '@masknet/web3-shared-evm'

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
        button: {
            marginLeft: theme.spacing(1),
        },
    }
})

export function OfferTab() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const account = useAccount()
    const { asset, token, provider, offers, offerPage, setOfferPage } = CollectibleState.useContainer()

    const isDifferenceToken = useMemo(() => {
        if (provider === CollectibleProvider.OPENSEA) {
            return (
                offers.value?.some(
                    (item) =>
                        (item.paymentTokenContract?.symbol !== 'WETH' && item.paymentTokenContract?.symbol !== 'ETH') ||
                        (item.quantity && new BigNumber(item.quantity).toString() !== '1'),
                ) && offers.value.filter((item) => isZero(item.expirationTime ?? 0)).length === 0
            )
        } else {
            return false
        }
    }, [provider, offers.value])

    const dataSource = useMemo(() => {
        if (!offers.value || !offers.value?.length) return []
        return offers.value
    }, [offers.value])

    if (offers.loading) return <LoadingTable />
    if (!offers.value || offers.error || !dataSource.length)
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
                <TableListPagination
                    handlePrevClick={() => setOfferPage((prev) => prev - 1)}
                    handleNextClick={() => setOfferPage((prev) => prev + 1)}
                    prevDisabled={offerPage === 0}
                    nextDisabled={dataSource.length < 10}
                    page={offerPage}
                    pageCount={10}
                />
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
                                {provider === CollectibleProvider.OPENSEA ? (
                                    <TableCell>{t('plugin_collectible_expiration')}</TableCell>
                                ) : null}
                            </>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataSource.map((order) => (
                        <OrderRow key={order.hash} order={order} isDifferenceToken={isDifferenceToken} />
                    ))}
                </TableBody>
                {(provider === CollectibleProvider.OPENSEA && dataSource.length) || offerPage > 0 ? (
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
