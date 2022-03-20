import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { DataProvider } from '@masknet/public-api'
import { FormattedCurrency } from '@masknet/shared'
import { formatCurrency } from '@masknet/web3-shared-evm'
import type { Trending } from '../../types'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    container: {
        borderRadius: 0,
        boxSizing: 'border-box',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    head: {
        padding: 0,
        border: 'none',
    },
    cell: {
        whiteSpace: 'nowrap',
        border: 'none',
    },
}))

export interface CoinMarketTableProps {
    dataProvider: DataProvider
    trending: Trending
}

export function CoinMarketTable(props: CoinMarketTableProps) {
    const { trending, dataProvider } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    return (
        <TableContainer className={classes.container} component={Paper} elevation={0}>
            <Table>
                <TableHead>
                    <TableRow>
                        {dataProvider !== DataProvider.UNISWAP_INFO ? (
                            <TableCell className={classes.head} align="center">
                                <Typography color="textSecondary" variant="body2">
                                    {t('plugin_trader_market_cap')}
                                </Typography>
                            </TableCell>
                        ) : null}
                        <TableCell className={classes.head} align="center">
                            <Typography color="textSecondary" variant="body2">
                                {t('plugin_trader_volume_24')}
                            </Typography>
                        </TableCell>
                        {dataProvider !== DataProvider.UNISWAP_INFO ? (
                            <>
                                <TableCell className={classes.head} align="center">
                                    <Typography color="textSecondary" variant="body2">
                                        {t('plugin_trader_circulating_supply')}
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.head} align="center">
                                    <Typography color="textSecondary" variant="body2">
                                        {t('plugin_trader_total_supply')}
                                    </Typography>
                                </TableCell>
                            </>
                        ) : null}
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        {dataProvider !== DataProvider.UNISWAP_INFO ? (
                            <TableCell className={classes.cell} align="center">
                                <FormattedCurrency
                                    symbol="USD"
                                    value={trending.market?.market_cap ?? 0}
                                    formatter={formatCurrency}
                                />
                            </TableCell>
                        ) : null}
                        <TableCell className={classes.cell} align="center">
                            <FormattedCurrency
                                symbol="USD"
                                value={trending.market?.total_volume ?? 0}
                                formatter={formatCurrency}
                            />
                        </TableCell>
                        {dataProvider !== DataProvider.UNISWAP_INFO ? (
                            <>
                                <TableCell className={classes.cell} align="center">
                                    <FormattedCurrency
                                        value={trending.market?.circulating_supply ?? 0}
                                        symbol={trending.coin.symbol}
                                        formatter={formatCurrency}
                                    />
                                </TableCell>
                                <TableCell className={classes.cell} align="center">
                                    <FormattedCurrency
                                        value={trending.market?.total_supply ?? 0}
                                        symbol={trending.coin.symbol}
                                        formatter={formatCurrency}
                                    />
                                </TableCell>
                            </>
                        ) : null}
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
