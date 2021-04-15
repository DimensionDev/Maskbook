import {
    makeStyles,
    createStyles,
    Button,
    Typography,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Skeleton,
    Box,
    TableHead,
    TableFooter,
} from '@material-ui/core'
import { OrderSide } from 'opensea-js/lib/types'
import { CollectibleState } from '../hooks/useCollectibleState'
import { useOrders } from '../hooks/useOrders'
import { CollectibleTab } from './CollectibleTab'
import { useMemo, useState } from 'react'
import { getOrderUnitPrice } from '../utils'
import { OrderRow } from './OrderRow'
import BigNumber from 'bignumber.js'
import { TableListPagination } from './Pagination'
import { useI18N } from '../../../utils/i18n-next-ui'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useCallback } from 'react'
import { PluginCollectibleRPC } from '../messages'
import { useAccount } from '../../../web3/hooks/useAccount'

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
            padding: theme.spacing(6, 0),
        },
        emptyCell: {
            borderStyle: 'none',
        },
        button: {
            marginLeft: theme.spacing(1),
        },
    })
})

export function OfferTab() {
    const { t } = useI18N()
    const classes = useStyles()
    const [page, setPage] = useState(0)
    const account = useAccount()
    const { asset, token } = CollectibleState.useContainer()
    const offers = useOrders(token, OrderSide.Buy, page)

    const isDifferenceToken = useMemo(
        () =>
            offers.value?.orders.some(
                (item) =>
                    (item.paymentTokenContract?.symbol !== 'WETH' && item.paymentTokenContract?.symbol !== 'ETH') ||
                    new BigNumber(item.quantity).toString() !== '1' ||
                    new BigNumber(item.expirationTime).isZero(),
            ),
        [offers.value],
    )

    const dataSource = useMemo(() => {
        if (!offers.value || !offers.value?.orders || !offers.value?.orders.length) return []
        return offers.value.orders
            .map((order) => {
                const unitPrice = new BigNumber(getOrderUnitPrice(order) ?? 0).toNumber()
                return {
                    ...order,
                    unitPrice,
                }
            })
            .sort((a, b) => {
                const current = new BigNumber(a.unitPrice)
                const next = new BigNumber(b.unitPrice)
                if (current.isLessThan(next)) {
                    return 1
                } else if (current.isGreaterThan(next)) {
                    return -1
                }
                return 0
            })
    }, [offers.value])

    const onMakeOffer = useCallback(async () => {
        console.log(asset)
        console.log(token)

        if (!token) return
        if (!asset.value) return

        try {
            const response = await PluginCollectibleRPC.createBuyOrder(
                token.contractAddress,
                token.tokenId,
                asset.value.assetContract.schemaName,
                account,
            )
            console.log(response)
        } catch (e) {
            console.log(e)
        }
    }, [account, asset, token])

    if (offers.loading)
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

    if (!offers.value || offers.error || !dataSource.length)
        return (
            <>
                <Table size="small">
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
                                    Retry
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                    <TableListPagination
                        handlePrevClick={() => setPage((prev) => prev - 1)}
                        handleNextClick={() => setPage((prev) => prev + 1)}
                        prevDisabled={page === 0}
                        nextDisabled={dataSource.length < 10}
                        page={page}
                        pageCount={10}
                    />
                </Table>
                <Box sx={{ padding: 2 }} display="flex" justifyContent="flex-end">
                    <ActionButton className={classes.button} color="primary" variant="contained" onClick={onMakeOffer}>
                        Make an Offer
                    </ActionButton>
                </Box>
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
                {dataSource.length || page > 0 ? (
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
            <Box sx={{ padding: 2 }} display="flex" justifyContent="flex-end">
                <ActionButton className={classes.button} color="primary" variant="contained" onClick={onMakeOffer}>
                    Make an Offer
                </ActionButton>
            </Box>
        </CollectibleTab>
    )
}
