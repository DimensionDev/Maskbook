import { useState, useEffect } from 'react'
import { makeStyles, Link, Tab, Tabs, Theme } from '@material-ui/core'
import { useI18N, useSettingsSwitcher, useValueRef } from '../../../../utils'
import type { TagType } from '../../types'
import { DataProvider, TradeProvider } from '@masknet/public-api'
import { resolveDataProviderName, resolveDataProviderLink } from '../../pipes'
import { useTrendingById, useTrendingByKeyword } from '../../trending/useTrending'
import { TickersTable } from './TickersTable'
import { PriceChangedTable } from './PriceChangedTable'
import { PriceChart } from './PriceChart'
import { usePriceStats } from '../../trending/usePriceStats'
import { Days, PriceChartDaysControl } from './PriceChartDaysControl'
import { useCurrentDataProvider } from '../../trending/useCurrentDataProvider'
import { useCurrentTradeProvider } from '../../trending/useCurrentTradeProvider'
import { TradeView } from '../trader/TradeView'
import { CoinMarketPanel } from './CoinMarketPanel'
import { TrendingViewError } from './TrendingViewError'
import { TrendingViewSkeleton } from './TrendingViewSkeleton'
import { TrendingViewDeck } from './TrendingViewDeck'
import { currentDataProviderSettings } from '../../settings'
import { useAvailableCoins } from '../../trending/useAvailableCoins'
import { usePreferredCoinId } from '../../trending/useCurrentCoinId'
import { EthereumTokenType, useTokenDetailed, useChainIdValid } from '@masknet/web3-shared'
import { TradeContext, useTradeContext } from '../../trader/useTradeContext'
import { currentNetworkSettings } from '../../../Wallet/settings'

const useStyles = makeStyles<Theme, { isPopper: boolean }>((theme) => {
    return {
        root: {
            width: '100%',
            boxShadow: 'none',
            borderRadius: 0,
            marginBottom: theme.spacing(2),
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        header: {},
        body: {
            minHeight: 303,
            overflow: 'hidden',
            border: `solid 1px ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
        },
        footer: {
            borderTop: `solid 1px ${theme.palette.divider}`,
            borderBottom: `solid 1px ${theme.palette.divider}`,
        },
        skeletonFooter: {
            borderBottom: `solid 1px ${theme.palette.divider}`,
        },
        tabs: {
            height: (props) => (props.isPopper ? 35 : 'auto'),
            width: '100%',
            minHeight: 'unset',

            borderTop: (props) => (props.isPopper ? 'unset' : `solid 1px ${theme.palette.divider}`),
            borderBottom: (props) => (props.isPopper ? 'unset' : `solid 1px ${theme.palette.divider}`),
        },
        content: {
            padding: 0,
            border: 'none',
        },
        tab: {
            height: (props) => (props.isPopper ? 35 : 'auto'),
            minHeight: 'unset',
            minWidth: 'unset',
        },
        tradeViewRoot: {
            maxWidth: 380,
        },
        priceChartRoot: {
            flex: 1,
        },
    }
})

export interface TraderViewProps {
    name: string
    tagType: TagType
    dataProviders: DataProvider[]
    tradeProviders: TradeProvider[]
    onUpdate?: () => void
    isPopper?: boolean
}

export function TraderView(props: TraderViewProps) {
    const { name, tagType, dataProviders, tradeProviders, isPopper = true } = props

    const { t } = useI18N()
    const classes = useStyles({ isPopper })

    const dataProvider = useCurrentDataProvider(dataProviders)
    const tradeProvider = useCurrentTradeProvider()
    const [tabIndex, setTabIndex] = useState(dataProvider !== DataProvider.UNISWAP_INFO ? 1 : 0)
    const chainIdValid = useChainIdValid()

    //#region track network type
    const networkType = useValueRef(currentNetworkSettings)
    useEffect(() => setTabIndex(0), [networkType])
    //#endregion

    //#region multiple coins share the same symbol
    const { value: coins = [] } = useAvailableCoins(tagType, name, dataProvider)
    //#endregion

    //#region merge trending
    const coinId = usePreferredCoinId(name, dataProvider)
    const trendingById = useTrendingById(coinId, dataProvider)
    const trendingByKeyword = useTrendingByKeyword(tagType, coinId ? '' : name, dataProvider)
    const {
        value: { currency, trending },
        error: trendingError,
        loading: loadingTrending,
    } = coinId ? trendingById : trendingByKeyword
    //#endregion

    //#region swap
    const {
        value: tokenDetailed,
        error: tokenDetailedError,
        loading: loadingTokenDetailed,
    } = useTokenDetailed(
        trending?.coin.symbol.toLowerCase() === 'eth' ? EthereumTokenType.Native : EthereumTokenType.ERC20,
        trending?.coin.symbol.toLowerCase() === 'eth' ? '' : trending?.coin.contract_address ?? '',
    )
    //#endregion

    //#region stats
    const [days, setDays] = useState(Days.ONE_WEEK)
    const {
        value: stats = [],
        loading: loadingStats,
        retry: retryStats,
    } = usePriceStats({
        coinId: trending?.coin.id,
        dataProvider: trending?.dataProvider,
        currency: trending?.currency,
        days,
    })
    //#endregion

    //#region trader context
    const tradeContext = useTradeContext(tradeProvider)
    //#endregion

    //#region current data provider switcher
    const DataProviderSwitcher = useSettingsSwitcher(
        currentDataProviderSettings,
        dataProviders,
        resolveDataProviderName,
    )
    //#endregion

    //#region api ready callback
    useEffect(() => {
        props.onUpdate?.()
    }, [tabIndex, loadingTrending])
    //#endregion

    //#region no available providers
    if (dataProviders.length === 0) return null
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
                reaction={DataProviderSwitcher}
                TrendingCardProps={{ classes: { root: isPopper ? '' : classes.root } }}
            />
        )
    //#endregion

    //#region if the coin is a native token or contract address exists

    const isSwapable =
        (!!trending?.coin.contract_address ||
            ['eth', 'matic', 'bnb'].includes(trending?.coin.symbol.toLowerCase() ?? '')) &&
        chainIdValid &&
        tradeProviders.length
    //#endregion

    //#region display loading skeleton
    if (!currency || !trending || loadingTrending)
        return (
            <TrendingViewSkeleton
                classes={{ footer: isPopper ? '' : classes.skeletonFooter }}
                TrendingCardProps={{ classes: { root: isPopper ? '' : classes.root } }}
            />
        )
    //#endregion

    //#region tabs
    const { coin, market, tickers } = trending
    const tabs = [
        <Tab className={classes.tab} key="market" label={t('plugin_trader_tab_market')} />,
        <Tab className={classes.tab} key="price" label={t('plugin_trader_tab_price')} />,
        <Tab className={classes.tab} key="exchange" label={t('plugin_trader_tab_exchange')} />,
        isSwapable ? <Tab className={classes.tab} key="swap" label={t('plugin_trader_tab_swap')} /> : null,
    ].filter(Boolean)
    //#endregion

    return (
        <TradeContext.Provider value={tradeContext}>
            <TrendingViewDeck
                classes={{
                    header: classes.header,
                    body: isPopper ? classes.body : '',
                    footer: isPopper ? '' : classes.footer,
                    content: isPopper ? '' : classes.content,
                }}
                stats={stats}
                coins={coins}
                currency={currency}
                trending={trending}
                dataProvider={dataProvider}
                tradeProvider={tradeProvider}
                showDataProviderIcon={tabIndex < 3}
                showTradeProviderIcon={tabIndex === 3}
                TrendingCardProps={{ classes: { root: isPopper ? '' : classes.root } }}
                dataProviders={dataProviders}
                tradeProviders={tradeProviders}>
                <Tabs
                    className={classes.tabs}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    value={tabIndex}
                    onChange={(ev: React.ChangeEvent<{}>, newValue: number) => setTabIndex(newValue)}
                    TabIndicatorProps={{
                        style: {
                            display: 'none',
                        },
                    }}>
                    {tabs}
                </Tabs>
                {tabIndex === 0 ? <CoinMarketPanel dataProvider={dataProvider} trending={trending} /> : null}
                {tabIndex === 1 ? (
                    <>
                        {market ? <PriceChangedTable market={market} /> : null}
                        <PriceChart
                            classes={{ root: isPopper ? classes.priceChartRoot : '' }}
                            coin={coin}
                            currency={currency}
                            stats={stats}
                            retry={retryStats}
                            loading={loadingStats}>
                            <PriceChartDaysControl days={days} onDaysChange={setDays} />
                        </PriceChart>
                    </>
                ) : null}
                {tabIndex === 2 ? <TickersTable tickers={tickers} dataProvider={dataProvider} /> : null}
                {tabIndex === 3 && isSwapable ? (
                    <TradeView
                        classes={{ root: isPopper ? classes.tradeViewRoot : '' }}
                        TraderProps={{
                            coin,
                            tokenDetailed,
                        }}
                    />
                ) : null}
            </TrendingViewDeck>
        </TradeContext.Provider>
    )
}
