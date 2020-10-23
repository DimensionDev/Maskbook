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
import { last } from 'lodash-es'
import { AlertCircle } from 'react-feather'
import { DataProvider, SwapProvider } from '../../types'
import {
    resolveDataProviderName,
    resolveDataProviderLink,
    resolveDataProviderCoinLink,
    resolveSwapProviderName,
    resolveSwapProviderLink,
} from '../../pipes'
import { getActivatedUI } from '../../../../social-network/ui'
import { formatCurrency } from '../../../Wallet/formatter'
import { useTrending } from '../../trending/useTrending'
import { TickersTable } from './TickersTable'
import { PriceChangedTable } from './PriceChangedTable'
import { PriceChanged } from './PriceChanged'
import { PriceChart } from './PriceChart'
import { Linking } from './Linking'
import { usePriceStats } from '../../trending/usePriceStats'
import { Skeleton } from '@material-ui/lab'
import { Days, PriceChartDaysControl } from './PriceChartDaysControl'
import { useCurrentDataProvider } from '../../trending/useCurrentDataProvider'
import { useCurrentSwapProvider } from '../../trending/useCurrentSwapProvider'
import { useCurrentCurrency } from '../../trending/useCurrentCurrency'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { CoinMarketCapIcon } from '../../../../resources/CoinMarketCapIcon'
import { Trader } from '../uniswap/Trader'
import { useConstant } from '../../../../web3/hooks/useConstant'
import { UniswapIcon } from '../../../../resources/UniswapIcon'
import { MaskbookTextIcon } from '../../../../resources/MaskbookIcon'
import { CONSTANTS } from '../../../../web3/constants'

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
            justifyContent: 'space-between',
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
        avatar: {
            backgroundColor: theme.palette.common.white,
        },
        currency: {
            marginRight: theme.spacing(1),
        },
        percentage: {
            marginLeft: theme.spacing(1),
        },
        maskbook: {
            width: 60,
            height: 9,
        },
        cmc: {
            width: 96,
            height: 16,
            verticalAlign: 'bottom',
        },
        uniswap: {
            width: 16,
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

//#region error
const useErrorStyles = makeStyles((theme: Theme) =>
    createStyles({
        placeholder: {
            padding: theme.spacing(18, 4),
        },
        icon: {
            width: theme.spacing(8),
            height: theme.spacing(8),
            marginBottom: theme.spacing(2),
            color: theme.palette.text.secondary,
        },
        message: {
            fontSize: 16,
        },
    }),
)
interface TrendingViewErrorProps {
    message: React.ReactNode
}

function TrendingViewError(props: TrendingViewErrorProps) {
    const classes = useStyles()
    const errorClasses = useErrorStyles()
    const { message } = props
    return (
        <Card className={classes.root} elevation={0} component="article">
            <CardContent className={classes.content}>
                <Box
                    className={errorClasses.placeholder}
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center">
                    <AlertCircle className={errorClasses.icon} />
                    <Typography className={errorClasses.message} color="textSecondary">
                        {message}
                    </Typography>
                </Box>
            </CardContent>
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
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')

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
    const [days, setDays] = useState(Days.ONE_YEAR)
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
    if (!currency) return <TrendingViewError message="Fail to load currency info." />

    // error: unknown coin or api error
    if (!trending)
        return (
            <TrendingViewError
                message={
                    <span>
                        Fail to load trending info from{' '}
                        <Link
                            color="primary"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={resolveDataProviderLink(dataProvider)}>
                            {resolveDataProviderName(dataProvider)}
                        </Link>
                        .
                    </span>
                }
            />
        )
    //#endregion

    const { coin, market, tickers } = trending
    const canSwap = trending.coin.eth_address || trending.coin.symbol.toLowerCase() === 'eth'

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
                    <Box display="flex" alignItems="center" justifyContent="space-between">
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
                            {market ? (
                                <>
                                    <span className={classes.currency}>{currency.name}</span>
                                    <span>
                                        {formatCurrency(
                                            dataProvider === DataProvider.COIN_MARKET_CAP
                                                ? last(stats)?.[1] ?? market.current_price
                                                : market.current_price,
                                            currency.symbol,
                                        )}
                                    </span>
                                </>
                            ) : (
                                <span>{t('plugin_trader_no_data')}</span>
                            )}
                            {typeof market?.price_change_percentage_24h === 'number' ? (
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
                        <Tab className={classes.tab} label={t('plugin_trader_tab_price')} />
                        <Tab className={classes.tab} label={t('plugin_trader_tab_exchange')} />
                        {canSwap ? <Tab className={classes.tab} label={t('plugin_trader_tab_swap')} /> : null}
                    </Tabs>
                    {tabIndex === 0 ? (
                        <>
                            {market ? <PriceChangedTable market={market} /> : null}
                            <PriceChart
                                stats={stats}
                                loading={loadingStats}
                                coinURL={resolveDataProviderCoinLink(dataProvider, coin)}>
                                <PriceChartDaysControl days={days} onDaysChange={setDays} />
                            </PriceChart>
                        </>
                    ) : null}
                    {tabIndex === 1 ? <TickersTable tickers={tickers} platform={dataProvider} /> : null}
                    {tabIndex === 2 && canSwap ? (
                        <Trader address={coin.eth_address ?? ETH_ADDRESS} name={coin.name} symbol={coin.symbol} />
                    ) : null}
                </Paper>
            </CardContent>
            <CardActions className={classes.footer}>
                <Typography className={classes.footnote} color="textSecondary" variant="subtitle2">
                    <span>Powered by </span>
                    <Link
                        className={classes.footlink}
                        color="textSecondary"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Maskbook"
                        href="https://maskbook.com">
                        <MaskbookTextIcon classes={{ root: classes.maskbook }} viewBox="0 0 60 9" />
                    </Link>
                </Typography>

                {tabIndex === 0 || tabIndex === 1 ? (
                    <Typography className={classes.footnote} color="textSecondary" variant="subtitle2">
                        <span>Data source </span>
                        <Link
                            className={classes.footlink}
                            color="textSecondary"
                            target="_blank"
                            rel="noopener noreferrer"
                            title={resolveDataProviderName(dataProvider)}
                            href={resolveDataProviderLink(dataProvider)}>
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
                        </Link>
                    </Typography>
                ) : null}

                {tabIndex === 2 ? (
                    <Typography className={classes.footnote} color="textSecondary" variant="subtitle2">
                        <span>Based on </span>
                        <Link
                            className={classes.footlink}
                            color="textSecondary"
                            target="_blank"
                            rel="noopener noreferrer"
                            title={resolveSwapProviderName(SwapProvider.UNISWAP)}
                            href={resolveSwapProviderLink(SwapProvider.UNISWAP)}>
                            {swapProvider === SwapProvider.UNISWAP ? (
                                <UniswapIcon classes={{ root: classes.uniswap }} viewBox="0 0 16 16" />
                            ) : (
                                resolveSwapProviderName(swapProvider)
                            )}
                        </Link>
                        {' V2'}
                    </Typography>
                ) : null}
            </CardActions>
        </Card>
    )
}
//#endregion
