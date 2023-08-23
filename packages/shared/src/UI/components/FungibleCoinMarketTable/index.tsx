import { makeStyles } from '@masknet/theme'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { type CurrencyType, formatCurrency, formatSupply } from '@masknet/web3-shared-base'
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
import { useSharedI18N } from '../../../locales/index.js'
import { useCurrencyType, useFiatCurrencyRate } from '@masknet/web3-hooks-base'
import { FormattedCurrency } from '../../wallet/FormattedCurrency.js'

const useStyles = makeStyles()({
    container: {
        borderRadius: 0,
        boxSizing: 'border-box',
        backgroundColor: 'transparent',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    head: {
        padding: 0,
        fontSize: 14,
        border: 'none',
    },
    cell: {
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
    const t = useSharedI18N()
    const { classes } = useStyles()
    const currencyType = useCurrencyType()
    const { data: fiatCurrencyRate = 1, isLoading } = useFiatCurrencyRate()

    const market = trending?.market

    return (
        <Stack>
            <Stack>
                <Typography fontSize={14} fontWeight={700} component="h3">
                    {t.usdc_price_statistic()}
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    {t.market_cap()}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                {market?.market_cap && !isLoading ? (
                                    <FormattedCurrency
                                        value={market.market_cap}
                                        formatter={formatCurrency}
                                        sign={sign}
                                    />
                                ) : (
                                    '--'
                                )}
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    {t.circulating_supply()}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                {formatSupply(market?.circulating_supply, '--')}
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    {t.volume_24()}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                {market?.total_volume && !isLoading ? (
                                    <FormattedCurrency
                                        value={market.total_volume}
                                        formatter={formatCurrency}
                                        sign={sign}
                                    />
                                ) : (
                                    '--'
                                )}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    {t.total_supply()}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>{formatSupply(market?.total_supply, '--')}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
})

export const FungibleCoinMarketTableSkeleton = memo(function FungibleCoinMarketTableSkeleton() {
    const { classes } = useStyles()
    const t = useSharedI18N()

    return (
        <Stack>
            <Stack>
                <Typography fontSize={14} fontWeight={700} component="h3">
                    {t.usdc_price_statistic()}
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    {t.market_cap()}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <Skeleton />
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    {t.circulating_supply()}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <Skeleton />
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    {t.volume_24()}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <Skeleton />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    {t.total_supply()}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <Skeleton />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
})
