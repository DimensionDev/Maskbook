import { useCallback, useMemo, useState } from 'react'
import {
    Box,
    Button,
    createStyles,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@material-ui/core'
import { useOrders } from '../hooks/useOrders'
import { OrderSide } from 'opensea-js/lib/types'
import BigNumber from 'bignumber.js'
import { CollectibleState } from '../hooks/useCollectibleState'
import { CollectibleTab } from './CollectibleTab'
import { OrderRow } from './OrderRow'
import { TableListPagination } from './Pagination'
import { useI18N } from '../../../utils/i18n-next-ui'
import { PluginCollectibleRPC } from '../messages'
import { toAsset } from '../helpers'
import { CollectibleProvider } from '../types'
import { ListingTabActionBar } from './ListingTabActionBar'
import { LoadingTable } from './LoadingTable'
import { ChainState } from '../../../web3/state/useChainState'
import { isSameAddress } from '../../../web3/helpers'

const useStyles = makeStyles((theme) => {
    return createStyles({
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
        button: {
            marginLeft: theme.spacing(1),
        },
    })
})

export function ListingTab() {
    const { t } = useI18N()
    const classes = useStyles()

    const { account } = ChainState.useContainer()
    const { token, asset, provider } = CollectibleState.useContainer()

    const [page, setPage] = useState(0)
    const listings = useOrders(OrderSide.Sell, page)

    const isDifferenceToken = useMemo(() => {
        if (provider === CollectibleProvider.OPENSEA) {
            return listings.value?.some(
                (item) =>
                    (item.paymentTokenContract?.symbol !== 'WETH' && item.paymentTokenContract?.symbol !== 'ETH') ||
                    (item.quantity && new BigNumber(item.quantity).toString() !== '1') ||
                    (item.expirationTime && new BigNumber(item.expirationTime).isZero()),
            )
        } else {
            return false
        }
    }, [provider, listings.value])

    const dataSource = useMemo(() => {
        if (!listings.value || !listings.value?.length) return []
        return listings.value.sort((a, b) => {
            const current = new BigNumber(a.unitPrice)
            const next = new BigNumber(b.unitPrice)
            if (current.isLessThan(next)) return -1
            else if (current.isGreaterThan(next)) return 1
            return 0
        })
    }, [listings.value])

    const onMakeListing = useCallback(async () => {
        if (!token) return
        if (!asset.value) return
        try {
            const response = await PluginCollectibleRPC.createBuyOrder({
                asset: toAsset({
                    tokenId: token.tokenId,
                    tokenAddress: token.contractAddress,
                    schemaName: asset.value?.assetContract?.schemaName,
                }),
                accountAddress: account,
                startAmount: 0.1,
            })
            console.log(response)
        } catch (e) {
            console.log(e)
        }
    }, [account, asset, token])

    console.log({
        asset: asset.value,
    })

    if (listings.loading) return <LoadingTable />
    if (!listings.value || listings.error || !dataSource.length)
        return (
            <>
                <Table size="small" stickyHeader>
                    <Box className={classes.empty}>
                        <Typography color="textSecondary">No Listings</Typography>
                        <Button
                            sx={{
                                marginTop: 1,
                            }}
                            variant="text"
                            onClick={() => listings.retry()}>
                            Retry
                        </Button>
                    </Box>
                </Table>
                {asset.value?.owner?.address && isSameAddress(asset.value.owner.address, account) ? (
                    <ListingTabActionBar />
                ) : null}
            </>
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
                                <TableCell>{t('plugin_collectible_expiration')}</TableCell>
                            </>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataSource.map((order) => (
                        <OrderRow key={order.hash} order={order} isDifferenceToken={isDifferenceToken} />
                    ))}
                </TableBody>
                {(provider === CollectibleProvider.OPENSEA && dataSource.length) || page > 0 ? (
                    <TableListPagination
                        handlePrevClick={() => setPage((prev) => prev - 1)}
                        handleNextClick={() => setPage((prev) => prev + 1)}
                        prevDisabled={page === 0}
                        nextDisabled={dataSource.length < 10}
                        page={page}
                        pageCount={10}
                    />
                ) : null}
            </Table>
            {asset.value?.owner?.address && isSameAddress(asset.value.owner.address, account) ? (
                <ListingTabActionBar />
            ) : null}
        </CollectibleTab>
    )
}
