import React, { useState, useEffect } from 'react'
import {
    makeStyles,
    Avatar,
    Typography,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Theme,
    createStyles,
    Link,
    Box,
    Paper,
    Tab,
    Tabs,
} from '@material-ui/core'
import { DataProvider, SwapProvider } from '../types'
import { resolveDataProviderName, resolveSwapProviderName } from '../pipes'
import { getActivatedUI } from '../../../social-network/ui'
import { formatCurrency } from '../../Wallet/formatter'
import { useTrending } from '../hooks/useTrending'
import { TickersTable } from './TickersTable'
import { PriceChangedTable } from './PriceChangedTable'
import { PriceChanged } from './PriceChanged'
import { PriceChart } from './PriceChart'
import { Linking } from './Linking'
import { usePriceStats } from '../hooks/usePriceStats'
import { Skeleton } from '@material-ui/lab'
import { PriceChartDaysControl } from './PriceChartDaysControl'
import { useCurrentDataProvider } from '../hooks/useCurrentDataProvider'
import { useCurrentSwapProvider } from '../hooks/useCurrentSwapProvider'
import { useCurrentCurrency } from '../hooks/useCurrentCurrency'
import { useI18N } from '../../../utils/i18n-next-ui'
import { CoinMarketCapIcon } from '../../../resources/CoinMarketCap'
import { UniswapTrader } from './Uniswap'
import { currentSwapProviderSettings } from '../settings'

const useStyles = makeStyles((theme: Theme) => {
    const internalName = getActivatedUI()?.internalName
    return createStyles({
        root: {
            width: 450,
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            ...(internalName === 'twitter'
                ? {
                      boxShadow: `${
                          theme.palette.type === 'dark'
                              ? 'rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px'
                              : 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px'
                      }`,
                  }
                : null),
        },
        content: {
            paddingTop: 0,
            paddingBottom: 0,
        },
        header: {
            display: 'flex',
            position: 'relative',
        },
        body: {
            overflow: 'hidden',
        },
        footer: {
            justifyContent: 'flex-end',
        },
        tabs: {
            height: 35,
            width: '100%',
            minHeight: 'unset',
        },
        tab: {
            height: 35,
            minHeight: 'unset',
            minWidth: 'unset',
        },
        section: {},
        rank: {
            color: theme.palette.text.primary,
            fontWeight: 300,
            marginRight: theme.spacing(1),
        },
        footnote: {
            fontSize: 10,
        },
        footlink: {
            cursor: 'pointer',
            marginRight: theme.spacing(0.5),
            '&:last-child': {
                marginRight: 0,
            },
        },
        avatar: {},
        percentage: {
            marginLeft: theme.spacing(1),
        },
        cmc: {
            width: 96,
            height: 16,
            verticalAlign: 'bottom',
        },
    })
})

//#region skeleton
interface TrendingViewSkeletonProps {}

function TrendingViewSkeleton(props: TrendingViewSkeletonProps) {
    const classes = useStyles()
    return (
        <Card className={classes.root} elevation={0} component="article">
            <CardHeader
                avatar={<Skeleton animation="wave" variant="circle" width={40} height={40} />}
                title={<Skeleton animation="wave" height={10} width="30%" />}
                subheader={<Skeleton animation="wave" height={10} width="20%" />}
            />
            <CardContent className={classes.content}>
                <Skeleton animation="wave" variant="rect" height={58} style={{ marginBottom: 8 }} />
                <Skeleton animation="wave" variant="rect" height={254} />
            </CardContent>
            <CardActions className={classes.footer}>
                <Skeleton animation="wave" height={10} width="30%" />
            </CardActions>
        </Card>
    )
}
//#endregion

//#region trending view
export interface TrendingViewProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    name: string
    dataProviders: DataProvider[]
    swapProviders: SwapProvider[]
    onUpdate?: () => void
}

export function TrendingView(props: TrendingViewProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const [tabIndex, setTabIndex] = useState(0)

    //#region trending
    const dataProvider = useCurrentDataProvider(props.dataProviders)
    const { value: currency, loading: loadingCurrency } = useCurrentCurrency(dataProvider)
    const { value: trending, loading: loadingTrending } = useTrending(props.name, dataProvider, currency)
    //#endregion

    //#region swap
    const swapProvider = useCurrentSwapProvider(props.swapProviders)
    //#endregion

    //#region stats
    const [days, setDays] = useState(365)
    const { value: stats = [], loading: loadingStats } = usePriceStats({
        coinId: trending?.coin.id,
        dataProvider: trending?.dataProvider,
        currency: trending?.currency,
        days,
    })
    //#endregion

    //#region api ready callback
    useEffect(() => {
        props.onUpdate?.()
    }, [tabIndex, loadingCurrency, loadingTrending])
    //#endregion

    //#region display loading skeleton
    if (loadingCurrency || loadingTrending) return <TrendingViewSkeleton />
    //#endregion
    //#region error handling
    // error: no available platform
    if (props.dataProviders.length === 0) return null

    // error: fail to load currency
    if (!currency) return null

    // error: unknown coin or api error
    if (!trending) return null
    //#endregion

    const { coin, market, tickers } = trending

    return (
        <Card className={classes.root} elevation={0} component="article">
            <CardHeader
                className={classes.header}
                avatar={
                    <Linking href={coin.home_url}>
                        <Avatar className={classes.avatar} src={coin.image_url} alt={coin.symbol} />
                    </Linking>
                }
                title={
                    <Box display="flex" alignItems="center">
                        <Typography variant="h6">
                            {typeof coin.market_cap_rank === 'number' ? (
                                <span className={classes.rank} title="Market Cap Rank">
                                    #{coin.market_cap_rank}
                                </span>
                            ) : null}
                            <Linking href={coin.home_url}>{coin.symbol.toUpperCase()}</Linking>
                            <span>{` / ${currency.name}`}</span>
                        </Typography>
                    </Box>
                }
                subheader={
                    <>
                        <Typography component="p" variant="body1">
                            <span>{`${`${currency.name} `}${formatCurrency(
                                market.current_price,
                                currency.symbol,
                            )}`}</span>
                            {typeof market.price_change_percentage_24h === 'number' ? (
                                <PriceChanged amount={market.price_change_percentage_24h} />
                            ) : null}
                        </Typography>
                    </>
                }
                disableTypography
            />
            <CardContent className={classes.content}>
                <Paper className={classes.body} variant="outlined">
                    <Tabs
                        className={classes.tabs}
                        textColor="primary"
                        variant="fullWidth"
                        value={tabIndex}
                        onChange={(ev: React.ChangeEvent<{}>, newValue: number) => setTabIndex(newValue)}
                        TabIndicatorProps={{
                            style: {
                                display: 'none',
                            },
                        }}>
                        <Tab className={classes.tab} label={t('plugin_trader_tab_price')}></Tab>
                        <Tab className={classes.tab} label={t('plugin_trader_tab_exchange')}></Tab>
                        <Tab className={classes.tab} label={t('plugin_trader_tab_swap')}></Tab>
                    </Tabs>
                    {tabIndex === 0 ? (
                        <>
                            <PriceChangedTable market={market} />
                            <PriceChart stats={stats} loading={loadingStats}>
                                <PriceChartDaysControl days={days} onDaysChange={setDays}></PriceChartDaysControl>
                            </PriceChart>
                        </>
                    ) : null}
                    {tabIndex === 1 ? <TickersTable tickers={tickers} platform={dataProvider} /> : null}
                    {tabIndex === 2 ? <UniswapTrader coin={coin} /> : null}
                </Paper>
            </CardContent>
            <CardActions className={classes.footer}>
                <Typography className={classes.footnote} color="textSecondary" variant="subtitle2">
                    {tabIndex === 2 ? (
                        <>
                            <span>{t('plugin_trader_switch_swap_provider')}</span>
                            {props.swapProviders.map((x) => (
                                <Link
                                    className={classes.footlink}
                                    key={x}
                                    color={swapProvider === x ? 'primary' : 'textSecondary'}
                                    onClick={() => {
                                        currentSwapProviderSettings.value = x
                                    }}>
                                    {resolveSwapProviderName(x)}
                                </Link>
                            ))}
                        </>
                    ) : (
                        <>
                            <span>{t('plugin_trader_data_source')}</span>
                            {dataProvider === DataProvider.COIN_MARKET_CAP ? (
                                <CoinMarketCapIcon
                                    classes={{
                                        root: classes.cmc,
                                    }}
                                    viewBox="0 0 96 16"
                                />
                            ) : (
                                resolveDataProviderName(dataProvider)
                            )}
                        </>
                    )}
                </Typography>
            </CardActions>
        </Card>
    )
}
//#endregion
