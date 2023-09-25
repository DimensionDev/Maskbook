import { Stack, Typography, Grid } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkDescriptor } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { TokenIcon, WalletIcon, FungibleCoinMarketTable } from '@masknet/shared'
import { CurrencyType, formatInteger, formatSupply, TokenType } from '@masknet/web3-shared-base'
import type { Trending } from '../../types/index.js'
import { useHighestFloorPrice, useNFT_TrendingOverview, useOneDaySaleAmounts } from '../../trending/useTrending.js'
import { useTraderI18N } from '../../locales/index.js'

const useStyles = makeStyles()((theme) => ({
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
    result: Web3Helper.TokenResultAll
    trending: Trending
}

export function NonFungibleCoinMarketTable(props: CoinMarketTableProps) {
    const t = useTraderI18N()
    const { trending, result } = props
    const chainId = result.chainId ?? trending.coin.chainId
    const { value: overview } = useNFT_TrendingOverview(result.pluginID, trending.coin.id, chainId)
    const { value: highestPrice_ } = useHighestFloorPrice(
        overview?.highest_price ?? trending.market?.highest_price ? '' : trending.coin.id,
    )
    const { value: salesOneDay_ } = useOneDaySaleAmounts(
        overview?.sales_24h ?? overview?.sales ?? trending.market?.total_24h ? '' : trending.coin.id,
    )
    const salesOneDay = salesOneDay_ ?? overview?.sales_24h ?? overview?.sales ?? trending.market?.total_24h
    const highestPrice = highestPrice_ ?? overview?.highest_price ?? trending.market?.highest_price

    const { classes, cx } = useStyles()
    const chain = useNetworkDescriptor(result.pluginID ?? NetworkPluginID.PLUGIN_EVM, chainId)
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
                        {t.plugin_trader_total_assets()}
                    </Typography>
                    <Typography color="textPrimary" variant="body2" className={classes.gridItemValue}>
                        {formatSupply(overview?.items_total ?? trending.market?.total_supply, '--')}
                    </Typography>
                </Grid>
                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t.plugin_trader_owners_count()}
                    </Typography>
                    <Typography color="textPrimary" variant="body2" className={classes.gridItemValue}>
                        {formatInteger(overview?.owners_total ?? trending.market?.owners_count, '--')}
                    </Typography>
                </Grid>
                <Grid item className={classes.gridItem}>
                    <Typography color="textSecondary" variant="body2" className={classes.gridItemTitle}>
                        {t.plugin_trader_market_cap()}
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
                        {t.plugin_trader_highest_price()}
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
                        {t.plugin_trader_total_volume()}
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
                        {t.plugin_trader_one_day_average_price()}
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
                        {t.plugin_trader_one_day_traded_volume()}
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
                        {t.plugin_trader_one_day_sale()}
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
    return isNFT ? (
        <NonFungibleCoinMarketTable {...props} />
    ) : (
        <FungibleCoinMarketTable {...props} sign={CurrencyType.USD} />
    )
}
