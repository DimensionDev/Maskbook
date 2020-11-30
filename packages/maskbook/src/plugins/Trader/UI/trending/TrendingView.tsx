import { useCallback, useState } from 'react'
import { DollarSign } from 'react-feather'
import {
    makeStyles,
    Avatar,
    Typography,
    CardHeader,
    CardContent,
    CardActions,
    createStyles,
    Link,
    Box,
    Paper,
    Tab,
    Tabs,
    IconButton,
} from '@material-ui/core'
import { first, last } from 'lodash-es'
import { DataProvider, TradeProvider } from '../../types'
import {
    resolveDataProviderName,
    resolveDataProviderLink,
    resolveTradeProviderName,
    resolveTradeProviderLink,
} from '../../pipes'
import { formatCurrency } from '../../../Wallet/formatter'
import { useTrending } from '../../trending/useTrending'
import { TickersTable } from './TickersTable'
import { PriceChangedTable } from './PriceChangedTable'
import { PriceChanged } from './PriceChanged'
import { PriceChart } from './PriceChart'
import { Linking } from './Linking'
import { usePriceStats } from '../../trending/usePriceStats'
import { Days, PriceChartDaysControl } from './PriceChartDaysControl'
import { useCurrentDataProvider } from '../../trending/useCurrentDataProvider'
import { useCurrentTradeProvider } from '../../trending/useCurrentTradeProvider'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { CoinMarketCapIcon } from '../../../../resources/CoinMarketCapIcon'
import { useConstant } from '../../../../web3/hooks/useConstant'
import { UniswapIcon } from '../../../../resources/UniswapIcon'
import { MaskbookTextIcon } from '../../../../resources/MaskbookIcon'
import { CONSTANTS } from '../../../../web3/constants'
import { TradeView } from '../trader/TradeView'
import { TrendingCard } from './TrendingCard'
import { TrendingViewError } from './TrendingViewError'
import { TrendingViewSkeleton } from './TrendingViewSkeleton'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { PluginTransakMessages } from '../../../Transak/messages'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { Flags } from '../../../../utils/flags'

const useStyles = makeStyles((theme) => {
    return createStyles({
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
            width: 40,
            height: 10,
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

export interface TrendingViewProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    name: string
    dataProviders: DataProvider[]
    tradeProviders: TradeProvider[]
    onUpdate?: () => void
}

export function TrendingView(props: TrendingViewProps) {
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')

    const { t } = useI18N()
    const classes = useStyles()
    const [tabIndex, setTabIndex] = useState(0)

    //#region trending
    const dataProvider = useCurrentDataProvider(props.dataProviders)
    const {
        value: { currency, trending },
        error: trendingError,
        loading: loadingTrending,
    } = useTrending(props.name, dataProvider)
    //#endregion

    //#region swap
    const tradeProvider = useCurrentTradeProvider(props.tradeProviders)
    //#endregion

    //#region stats
    const [days, setDays] = useState(Days.ONE_WEEK)
    const { value: stats = [], loading: loadingStats } = usePriceStats({
        coinId: trending?.coin.id,
        dataProvider: trending?.dataProvider,
        currency: trending?.currency,
        days,
    })
    //#endregion

    //#region buy
    const account = useAccount()
    const [, setBuyDialogOpen] = useRemoteControlledDialog(PluginTransakMessages.events.buyTokenDialogUpdated)

    const onBuyButtonClicked = useCallback(() => {
        setBuyDialogOpen({
            open: true,
            code: coin.symbol,
            address: account,
        })
    }, [account, trending?.coin?.symbol])
    //#endregion

    //#region no available platform
    if (props.dataProviders.length === 0) return null
    //#endregion

    //#region error handling
    // error: unknown coin or api error
    if (trendingError)
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

    //#region display loading skeleton
    if (loadingTrending || !currency || !trending) return <TrendingViewSkeleton />
    //#endregion

    const { coin, market, tickers } = trending
    const canSwap = trending.coin.eth_address || trending.coin.symbol.toLowerCase() === 'eth'

    return (
        <TrendingCard>
            <CardHeader
                className={classes.header}
                avatar={
                    <Linking href={first(coin.home_urls)}>
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
                            <Linking href={first(coin.home_urls)}>{coin.symbol.toUpperCase()}</Linking>
                            <span>{` / ${currency.name}`}</span>
                        </Typography>
                        {account && trending.coin.symbol && Flags.transak_enabled ? (
                            <IconButton color="primary" onClick={onBuyButtonClicked}>
                                <DollarSign size={18} />
                            </IconButton>
                        ) : null}
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
                            <PriceChart coin={coin} stats={stats} loading={loadingStats}>
                                <PriceChartDaysControl days={days} onDaysChange={setDays} />
                            </PriceChart>
                        </>
                    ) : null}
                    {tabIndex === 1 ? <TickersTable tickers={tickers} dataProvider={dataProvider} /> : null}
                    {tabIndex === 2 && canSwap ? (
                        <TradeView
                            TraderProps={{
                                address: coin.eth_address ?? ETH_ADDRESS,
                                name: coin.name,
                                symbol: coin.symbol,
                            }}
                        />
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
                        title="Mask Network"
                        href="https://mask.io">
                        <MaskbookTextIcon classes={{ root: classes.maskbook }} viewBox="0 0 80 20" />
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
                            title={resolveTradeProviderName(TradeProvider.UNISWAP)}
                            href={resolveTradeProviderLink(TradeProvider.UNISWAP)}>
                            {tradeProvider === TradeProvider.UNISWAP ? (
                                <UniswapIcon classes={{ root: classes.uniswap }} viewBox="0 0 16 16" />
                            ) : (
                                resolveTradeProviderName(tradeProvider)
                            )}
                        </Link>
                        {' V2'}
                    </Typography>
                ) : null}
            </CardActions>
        </TrendingCard>
    )
}
