import { Paper, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { DataProvider } from '@masknet/public-api'
import { FormattedCurrency } from '@masknet/shared'
import { ethFormatter, formatCurrency, formatSupply } from '@masknet/web3-shared-base'
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
        textAlign: 'right',
        fontWeight: 700,
    },
}))

export interface CoinMarketTableProps {
    dataProvider: DataProvider
    trending: Trending
}

export function FungibleCoinMarketTable(props: CoinMarketTableProps) {
    const { trending, dataProvider } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <Stack>
            <Stack>
                <Typography fontSize={14} fontWeight={700}>
                    {t('plugin_trader_market_statistic')}
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table size="small">
                    <TableBody>
                        {DataProvider.UNISWAP_INFO === dataProvider ? (
                            <TableRow>
                                <TableCell className={classes.head}>
                                    <Typography color="textSecondary" variant="body2">
                                        {t('plugin_trader_market_cap')}
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.cell}>
                                    <FormattedCurrency
                                        value={trending.market?.market_cap ?? 0}
                                        formatter={formatCurrency}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : null}
                        {DataProvider.UNISWAP_INFO === dataProvider ? (
                            <TableRow>
                                <TableCell className={classes.head}>
                                    <Typography color="textSecondary" variant="body2">
                                        {t('plugin_trader_circulating_supply')}
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.cell}>
                                    {trending.market?.circulating_supply
                                        ? formatSupply(trending.market.circulating_supply)
                                        : '--'}
                                </TableCell>
                            </TableRow>
                        ) : null}
                        <TableRow>
                            <TableCell className={classes.head}>
                                <Typography color="textSecondary" variant="body2">
                                    {t('plugin_trader_volume_24')}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <FormattedCurrency
                                    value={trending.market?.total_volume ?? 0}
                                    formatter={formatCurrency}
                                />
                            </TableCell>
                        </TableRow>
                        {dataProvider !== DataProvider.UNISWAP_INFO ? (
                            <TableRow>
                                <TableCell className={classes.head}>
                                    <Typography color="textSecondary" variant="body2">
                                        {t('plugin_trader_total_supply')}
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.cell}>
                                    {trending.market?.total_supply ? formatSupply(trending.market.total_supply) : '--'}
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
    const { trending } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <Stack>
            <Stack>
                <Typography fontSize={14} fontWeight={700}>
                    {t('plugin_trader_usdc_price_statistic')}
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell className={classes.head}>
                                <Typography color="textSecondary" variant="body2">
                                    {t('plugin_trader_floor_price')}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <FormattedCurrency
                                    value={trending.market?.floor_price ?? 0}
                                    sign="&#x039E;"
                                    formatter={ethFormatter}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.head}>
                                <Typography color="textSecondary" variant="body2">
                                    {t('plugin_trader_volume_24')}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                <FormattedCurrency
                                    value={trending.market?.total_24h ?? 0}
                                    sign="&#x039E;"
                                    formatter={ethFormatter}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.head}>
                                <Typography color="textSecondary" variant="body2">
                                    {t('plugin_trader_owners_count')}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>{trending.market?.owners_count ?? '--'}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.head}>
                                <Typography color="textSecondary" variant="body2">
                                    {t('plugin_trader_total_assets')}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                {trending.market?.total_supply ? formatSupply(trending.market?.total_supply) : '--'}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
}

export function CoinMarketTable(props: CoinMarketTableProps) {
    const isNFT = props.dataProvider === DataProvider.NFTSCAN
    return isNFT ? <NonFungibleCoinMarketTable {...props} /> : <FungibleCoinMarketTable {...props} />
}
