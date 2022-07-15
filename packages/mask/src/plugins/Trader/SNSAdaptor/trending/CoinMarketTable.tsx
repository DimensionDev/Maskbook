import { Paper, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { DataProvider } from '@masknet/public-api'
import { FormattedCurrency } from '@masknet/shared'
import { formatCurrency, formatInteger, formatSupply, TokenType } from '@masknet/web3-shared-base'
import type { Trending } from '../../types'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
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
        border: 'none',
    },
    cell: {
        whiteSpace: 'nowrap',
        border: 'none',
        textAlign: 'right',
        fontWeight: 700,
    },
}))

export interface CoinMarketTableProps {
    dataProvider: DataProvider
    trending: Trending
}

export function FungibleCoinMarketTable(props: CoinMarketTableProps) {
    const {
        trending: { market },
        dataProvider,
    } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <Stack>
            <Stack>
                <Typography fontSize={14} fontWeight={700} component="h3">
                    {t('plugin_trader_usdc_price_statistic')}
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table size="small">
                    <TableBody>
                        {DataProvider.UNISWAP_INFO !== dataProvider ? (
                            <TableRow>
                                <TableCell className={classes.head} component="th">
                                    <Typography color="textSecondary" variant="body2">
                                        {t('plugin_trader_market_cap')}
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.cell}>
                                    {market?.market_cap ? `$${formatSupply(market.market_cap)}` : '--'}
                                </TableCell>
                            </TableRow>
                        ) : null}
                        {DataProvider.UNISWAP_INFO !== dataProvider ? (
                            <TableRow>
                                <TableCell className={classes.head} component="th">
                                    <Typography color="textSecondary" variant="body2">
                                        {t('plugin_trader_circulating_supply')}
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.cell}>
                                    {formatSupply(market?.circulating_supply, '--')}
                                </TableCell>
                            </TableRow>
                        ) : null}
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2">
                                    {t('plugin_trader_volume_24')}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                {market?.total_volume ? `$${formatSupply(market.total_volume)}` : '--'}
                            </TableCell>
                        </TableRow>
                        {dataProvider !== DataProvider.UNISWAP_INFO ? (
                            <TableRow>
                                <TableCell className={classes.head} component="th">
                                    <Typography color="textSecondary" variant="body2">
                                        {t('plugin_trader_total_supply')}
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.cell}>
                                    {formatSupply(market?.total_supply, '--')}
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
}

export function NonFungibleCoinMarketTable(props: CoinMarketTableProps) {
    const {
        trending: { market },
    } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <Stack>
            <Stack>
                <Typography fontSize={14} fontWeight={700} component="h3">
                    {t('plugin_trader_market_statistic')}
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2">
                                    {t('plugin_trader_floor_price')}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <FormattedCurrency
                                    value={market?.floor_price ?? 0}
                                    sign="ETH"
                                    formatter={formatCurrency}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2">
                                    {t('plugin_trader_volume_24')}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <FormattedCurrency
                                    value={market?.total_24h ?? 0}
                                    sign="ETH"
                                    formatter={formatCurrency}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2">
                                    {t('plugin_trader_owners_count')}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>{formatInteger(market?.owners_count, '--')}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2">
                                    {t('plugin_trader_total_assets')}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>{formatSupply(market?.total_supply, '--')}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
}

export function CoinMarketTable(props: CoinMarketTableProps) {
    const isNFT = props.trending.coin.type === TokenType.NonFungible
    return isNFT ? <NonFungibleCoinMarketTable {...props} /> : <FungibleCoinMarketTable {...props} />
}
