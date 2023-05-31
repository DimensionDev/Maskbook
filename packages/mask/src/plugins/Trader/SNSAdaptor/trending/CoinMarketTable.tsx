import { Paper, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography, Grid } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkDescriptor } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { TokenIcon, WalletIcon } from '@masknet/shared'
import { type SourceType, formatInteger, formatMarketCap, formatSupply, TokenType } from '@masknet/web3-shared-base'
import type { Trending } from '../../types/index.js'
import { useI18N } from '../../../../utils/index.js'
import { useHighestFloorPrice, useNFT_TrendingOverview, useOneDaySaleAmounts } from '../../trending/useTrending.js'

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
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
    },
    gridItem: {
        display: 'flex',
        width: 132.5,
        height: 66,
        background: theme.palette.maskColor.bg,
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
    gridItemValue: {
        fontSize: 14,
        fontWeight: 700,
    },
    amountWrapper: {
        display: 'flex',
        alignItems: 'center',
    },
    amount: {
        marginLeft: 4,
    },
}))

export interface CoinMarketTableProps {
    dataProvider: SourceType
    result: Web3Helper.TokenResultAll
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
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    {t('plugin_trader_market_cap')}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                {market?.market_cap ? formatMarketCap(market.market_cap) : '--'}
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    {t('plugin_trader_circulating_supply')}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                {formatSupply(market?.circulating_supply, '--')}
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    {t('plugin_trader_volume_24')}
                                </Typography>
                            </TableCell>
                            <TableCell className={classes.cell}>
                                {market?.total_volume ? `$${formatSupply(market.total_volume)}` : '--'}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className={classes.head} component="th">
                                <Typography color="textSecondary" variant="body2" className={classes.label}>
                                    {t('plugin_trader_total_supply')}
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

export function NonFungibleCoinMarketTable(props: CoinMarketTableProps) {
    const { t } = useI18N()
    const { trending } = props
    const chainId = props.result.chainId ?? trending.coin.chainId
    const { value: overview } = useNFT_TrendingOverview(props.result.pluginID, trending.coin.id, chainId)
    const { value: highestPrice_ } = useHighestFloorPrice(
        overview?.highest_price ?? trending.market?.highest_price ? '' : trending.coin.id,
    )
    const { value: salesOneDay_ } = useOneDaySaleAmounts(
        overview?.sales_24h ?? overview?.sales ?? trending.market?.total_24h ? '' : trending.coin.id,
    )
    const salesOneDay = salesOneDay_ ?? overview?.sales_24h ?? overview?.sales ?? trending.market?.total_24h
    const highestPrice = highestPrice_ ?? overview?.highest_price ?? trending.market?.highest_price

    const { classes, cx } = useStyles()
    const chain = useNetworkDescriptor(props.result.pluginID ?? NetworkPluginID.PLUGIN_EVM, chainId)
    const PaymentIcon = trending.market?.price_token_address ? (
        <TokenIcon address={trending.market?.price_token_address} chainId={chainId} size={14} />
    ) : (
        <WalletIcon mainIcon={chain?.icon} size={14} />
    )

    return (
        <Stack>
            <Grid spacing={4} className={classes.gridContainer}>
                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_total_assets')}
                    </Typography>
                    <Typography color="textPrimary" variant="body2" className={classes.gridItemValue}>
                        {formatSupply(overview?.items_total ?? trending.market?.total_supply, '--')}
                    </Typography>
                </Grid>
                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_owners_count')}
                    </Typography>
                    <Typography color="textPrimary" variant="body2" className={classes.gridItemValue}>
                        {formatInteger(overview?.owners_total ?? trending.market?.owners_count, '--')}
                    </Typography>
                </Grid>
                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_market_cap')}
                    </Typography>
                    <div className={classes.amountWrapper}>
                        {overview?.market_cap ? PaymentIcon : null}
                        <Typography
                            color="textPrimary"
                            variant="body2"
                            className={cx(classes.gridItemValue, classes.amount)}>
                            {formatInteger(overview?.market_cap ?? trending.market?.market_cap, '--')}
                        </Typography>
                    </div>
                </Grid>
                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_highest_price')}
                    </Typography>
                    <div className={classes.amountWrapper}>
                        {highestPrice ? PaymentIcon : null}
                        <Typography
                            color="textPrimary"
                            variant="body2"
                            className={cx(classes.gridItemValue, classes.amount)}>
                            {formatSupply(highestPrice, '--')}
                        </Typography>
                    </div>
                </Grid>

                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_total_volume')}
                    </Typography>
                    <div className={classes.amountWrapper}>
                        {overview?.total_volume ? PaymentIcon : null}
                        <Typography
                            color="textPrimary"
                            variant="body2"
                            className={cx(classes.gridItemValue, classes.amount)}>
                            {formatSupply(overview?.total_volume ?? trending.market?.total_volume, '--')}
                        </Typography>
                    </div>
                </Grid>

                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_one_day_average_price')}
                    </Typography>
                    <div className={classes.amountWrapper}>
                        {overview?.average_price_24h ?? overview?.average_price ? PaymentIcon : null}
                        <Typography
                            color="textPrimary"
                            variant="body2"
                            className={cx(classes.gridItemValue, classes.amount)}>
                            {formatSupply(overview?.average_price_24h ?? overview?.average_price, '--')}
                        </Typography>
                    </div>
                </Grid>

                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_one_day_traded_volume')}
                    </Typography>
                    <div className={classes.amountWrapper}>
                        {overview?.volume_24h ?? overview?.volume ? PaymentIcon : null}
                        <Typography
                            color="textPrimary"
                            variant="body2"
                            className={cx(classes.gridItemValue, classes.amount)}>
                            {formatSupply(
                                overview?.volume_24h ?? overview?.volume ?? trending.market?.volume_24h,
                                '--',
                            )}
                        </Typography>
                    </div>
                </Grid>

                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t('plugin_trader_one_day_sale')}
                    </Typography>
                    <Typography color="textPrimary" variant="body2" className={classes.gridItemValue}>
                        {formatSupply(salesOneDay, '--')}
                    </Typography>
                </Grid>
            </Grid>
        </Stack>
    )
}

export function CoinMarketTable(props: CoinMarketTableProps) {
    const isNFT = props.trending.coin.type === TokenType.NonFungible
    return isNFT ? <NonFungibleCoinMarketTable {...props} /> : <FungibleCoinMarketTable {...props} />
}
