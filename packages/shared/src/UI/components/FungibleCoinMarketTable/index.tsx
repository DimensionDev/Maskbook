import { makeStyles } from '@masknet/theme'
import { useFiatCurrencyRate } from '@masknet/web3-hooks-base'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { formatCurrency, formatSupply, type CurrencyType } from '@masknet/web3-shared-base'
import {
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from '@mui/material'
import { memo } from 'react'
import { FormattedCurrency } from '../../wallet/FormattedCurrency.js'
import { ProgressiveText } from '../ProgressiveText/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()({
    container: {
        borderRadius: 0,
        boxSizing: 'border-box',
        backgroundColor: 'transparent',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    head: {
        padding: 0,
        fontSize: 14,
        border: 'none',
    },
    value: {
        whiteSpace: 'nowrap',
        border: 'none',
        fontSize: 14,
        textAlign: 'right',
        fontWeight: 700,
    },
    label: {
        fontSize: 14,
    },
})
interface CoinMarketTableProps {
    trending?: TrendingAPI.Trending | null
    sign?: CurrencyType
}
export const FungibleCoinMarketTable = memo(function FungibleCoinMarketTable({ trending, sign }: CoinMarketTableProps) {
    const { classes } = useStyles()
    const { isPending } = useFiatCurrencyRate()

    const market = trending?.market

    return (
        <Stack>
            <Stack>
                <Typography fontSize={14} fontWeight={700} component="h3">
                    <Trans>Price Statistic</Trans>
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    <Trans>Market Cap</Trans>
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.value}>
                                {market?.market_cap ?
                                    <ProgressiveText className={classes.value} loading={isPending} skeletonWidth={60}>
                                        <FormattedCurrency
                                            value={market.market_cap}
                                            formatter={formatCurrency}
                                            sign={sign}
                                        />
                                    </ProgressiveText>
                                :   '--'}
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    <Trans>Circulating Supply</Trans>
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.value}>
                                {formatSupply(market?.circulating_supply, '--')}
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    <Trans>24 Hour Trading Vol</Trans>
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.value}>
                                {market?.total_volume ?
                                    <ProgressiveText className={classes.value} loading={isPending} skeletonWidth={60}>
                                        <FormattedCurrency
                                            value={market.total_volume}
                                            formatter={formatCurrency}
                                            sign={sign}
                                        />
                                    </ProgressiveText>
                                :   '--'}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    <Trans>Total Supply</Trans>
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.value}>{formatSupply(market?.total_supply, '--')}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
})

export const FungibleCoinMarketTableSkeleton = memo(function FungibleCoinMarketTableSkeleton() {
    const { classes } = useStyles()

    return (
        <Stack>
            <Stack>
                <Typography fontSize={14} fontWeight={700} component="h3">
                    <Trans>Price Statistic</Trans>
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    <Trans>Market Cap</Trans>
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.value}>
                                <Skeleton />
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    <Trans>Circulating Supply</Trans>
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.value}>
                                <Skeleton />
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    <Trans>24 Hour Trading Vol</Trans>
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.value}>
                                <Skeleton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    <Trans>Total Supply</Trans>
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.value}>
                                <Skeleton />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
})
