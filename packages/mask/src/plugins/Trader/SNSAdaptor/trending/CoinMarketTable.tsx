import { Paper, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography, Grid } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useNetworkDescriptor } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { WalletIcon } from '@masknet/shared'
import { SourceType, formatInteger, formatMarketCap, formatSupply, TokenType } from '@masknet/web3-shared-base'
import type { Trending } from '../../types/index.js'
import { useI18N } from '../../../../utils/index.js'
import { useTrendingOverviewByAddress } from '../../trending/useTrending.js'

const useStyles = makeStyles()((theme) => ({
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
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
    },
    gridItem: {
        display: 'flex',
        width: 132.5,
        height: 66,
        background: theme.palette.background.default,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        fontWeight: 700,
        fontSize: 14,
    },
    gridItemTitle: {
        fontSize: 12,
        fontWeight: 400,
    },
    amountWrapper: {
        display: 'flex',
        alignItems: 'center',
    },
    amount: {
        marginLeft: 4,
        fontWeight: 700,
    },
}))

export interface CoinMarketTableProps {
    dataProvider: SourceType
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
                        {SourceType.UniswapInfo !== dataProvider ? (
                            <TableRow>
                                <TableCell className={classes.head} component="th">
                                    <Typography color="textSecondary" variant="body2">
                                        {t('plugin_trader_market_cap')}
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.cell}>
                                    {market?.market_cap ? formatMarketCap(market.market_cap) : '--'}
                                </TableCell>
                            </TableRow>
                        ) : null}
                        {SourceType.UniswapInfo !== dataProvider ? (
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
                        {dataProvider !== SourceType.UniswapInfo ? (
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
    const { t } = useI18N()
    const { value: overview } = useTrendingOverviewByAddress(props.trending.coin.address ?? '')
    const { classes } = useStyles()
    const chain = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, props.trending.coin.chainId)

    return (
        <Stack>
            <Grid spacing={4} className={classes.gridContainer}>
                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_total_assets')}
                    </Typography>
                    {formatSupply(overview?.items_total, '--')}
                </Grid>
                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_owners_count')}
                    </Typography>
                    {formatInteger(overview?.owners_total, '--')}
                </Grid>
                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_market_cap')}
                    </Typography>
                    <div className={classes.amountWrapper}>
                        <WalletIcon mainIcon={chain?.icon} size={14} />
                        <span className={classes.amount}>{formatInteger(overview?.market_cap, '--')}</span>
                    </div>
                </Grid>
                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_highest_price')}
                    </Typography>
                    <div className={classes.amountWrapper}>
                        <WalletIcon mainIcon={chain?.icon} size={14} />
                        <span className={classes.amount}>{formatSupply(overview?.highest_price, '--')}</span>
                    </div>
                </Grid>

                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_total_volume')}
                    </Typography>
                    <div className={classes.amountWrapper}>
                        <WalletIcon mainIcon={chain?.icon} size={14} />
                        <span className={classes.amount}>{formatSupply(overview?.total_volume, '--')}</span>
                    </div>
                </Grid>

                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_one_day_average_price')}
                    </Typography>
                    <div className={classes.amountWrapper}>
                        <WalletIcon mainIcon={chain?.icon} size={14} />
                        <span className={classes.amount}> {formatSupply(overview?.average_price_24h, '--')}</span>
                    </div>
                </Grid>

                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_one_day_traded_volume')}
                    </Typography>
                    <div className={classes.amountWrapper}>
                        <WalletIcon mainIcon={chain?.icon} size={14} />
                        <span className={classes.amount}> {formatSupply(overview?.volume_24h, '--')}</span>
                    </div>
                </Grid>

                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_one_day_sale')}
                    </Typography>
                    {formatSupply(overview?.sales_24h, '--')}
                </Grid>
            </Grid>
        </Stack>
    )
}

export function CoinMarketTable(props: CoinMarketTableProps) {
    const isNFT = props.trending.coin.type === TokenType.NonFungible
    return isNFT ? <NonFungibleCoinMarketTable {...props} /> : <FungibleCoinMarketTable {...props} />
}
