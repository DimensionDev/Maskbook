import { useState, useEffect } from 'react'
import { Link, Tab, Tabs } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N, useSettingsSwitcher } from '../../../../utils'
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
import { EthereumTokenType, useFungibleTokenDetailed, useChainIdValid, useNetworkType } from '@masknet/web3-shared-evm'
import { TradeContext, useTradeContext } from '../../trader/useTradeContext'

const useStyles = makeStyles<{ isPopper: boolean }>()((theme, props) => {
    return {
        root: props.isPopper
            ? {
                  width: 450,
                  boxShadow:
                      theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px'
                          : 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px',
              }
            : {
                  width: '100%',
                  boxShadow: 'none',
                  borderRadius: 0,
                  marginBottom: theme.spacing(2),
              },
        body: props.isPopper
            ? {
                  minHeight: 303,
                  overflow: 'hidden',
                  border: `solid 1px ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
              }
            : {},
        footer: props.isPopper
            ? {}
            : {
                  borderTop: `solid 1px ${theme.palette.divider}`,
                  borderBottom: `solid 1px ${theme.palette.divider}`,
              },
        footerSkeleton: props.isPopper
            ? {}
            : {
                  borderBottom: `solid 1px ${theme.palette.divider}`,
              },
        tabs: {
            height: props.isPopper ? 35 : 'auto',
            width: '100%',
            minHeight: 'unset',
            borderTop: props.isPopper ? 'unset' : `solid 1px ${theme.palette.divider}`,
            borderBottom: props.isPopper ? 'unset' : `solid 1px ${theme.palette.divider}`,
        },
        content: props.isPopper
            ? {}
            : {
                  padding: 0,
                  border: 'none',
              },
        tab: {
            height: props.isPopper ? 35 : 'auto',
            minHeight: 'unset',
            minWidth: 'unset',
        },
        tradeViewRoot: props.isPopper
            ? {
                  maxWidth: 380,
              }
            : {},
        priceChartRoot: props.isPopper
            ? {
                  flex: 1,
              }
            : {},
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
    const { classes } = useStyles({ isPopper })
    const dataProvider = useCurrentDataProvider(dataProviders)
    const tradeProvider = useCurrentTradeProvider()
    const [tabIndex, setTabIndex] = useState(dataProvider !== DataProvider.UNISWAP_INFO ? 1 : 0)
    const chainIdValid = useChainIdValid()

    // #region track network type
    const networkType = useNetworkType()
    useEffect(() => setTabIndex(0), [networkType])
    // #endregion

    // #region multiple coins share the same symbol
    const { value: coins = [] } = useAvailableCoins(tagType, name, dataProvider)
    // #endregion

    // #region merge trending
    const coinId = usePreferredCoinId(name, dataProvider)
    const trendingById = useTrendingById(name ? '' : coinId, dataProvider)
    const trendingByKeyword = useTrendingByKeyword(tagType, coinId ? '' : name, dataProvider)
    const {
        value: { currency, trending },
        error: trendingError,
        loading: loadingTrending,
    } = coinId ? trendingById : trendingByKeyword
    // #endregion

    const coinSymbol = (trending?.coin.symbol || '').toLowerCase()

    // #region swap
    const {
        value: tokenDetailed,
        error: tokenDetailedError,
        loading: loadingTokenDetailed,
    } = useFungibleTokenDetailed(
        coinSymbol === 'eth' ? EthereumTokenType.Native : EthereumTokenType.ERC20,
        coinSymbol === 'eth' ? '' : trending?.coin.contract_address ?? '',
    )
    // #endregion

    // #region stats
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
    // #endregion

    // #region trader context
    const tradeContext = useTradeContext(tradeProvider)
    // #endregion

    // #region current data provider switcher
    const DataProviderSwitcher = useSettingsSwitcher(
        currentDataProviderSettings,
        dataProviders,
        resolveDataProviderName,
    )
    // #endregion

    // #region api ready callback
    useEffect(() => {
        props.onUpdate?.()
    }, [tabIndex, loadingTrending])
    // #endregion

    // #region no available providers
    if (dataProviders.length === 0) return null
    // #endregion

    // #region error handling
    // error: unknown coin or api error
    if (trendingError)
        return (
            <TrendingViewError
                message={
                    <span>
                        {t('plugin_trader_fail_to_load')}
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
                TrendingCardProps={{ classes: { root: classes.root } }}
            />
        )
    // #endregion

    // #region if the coin is a native token or contract address exists

    const isSwappable =
        (!!trending?.coin.contract_address || ['eth', 'matic', 'bnb'].includes(coinSymbol)) &&
        chainIdValid &&
        tradeProviders.length
    // #endregion

    // #region display loading skeleton
    if (!currency || !trending || loadingTrending)
        return (
            <TrendingViewSkeleton
                classes={{ footer: classes.footerSkeleton }}
                TrendingCardProps={{ classes: { root: classes.root } }}
            />
        )
    // #endregion

    // #region tabs
    const { coin, market, tickers } = trending
    const tabs = [
        <Tab className={classes.tab} key="market" label={t('plugin_trader_tab_market')} />,
        <Tab className={classes.tab} key="price" label={t('plugin_trader_tab_price')} />,
        <Tab className={classes.tab} key="exchange" label={t('plugin_trader_tab_exchange')} />,
        isSwappable ? <Tab className={classes.tab} key="swap" label={t('plugin_trader_tab_swap')} /> : null,
    ].filter(Boolean)
    // #endregion

    return (
        <TradeContext.Provider value={tradeContext}>
            <TrendingViewDeck
                classes={{
                    body: classes.body,
                    footer: classes.footer,
                    content: classes.content,
                }}
                stats={stats}
                coins={coins}
                currency={currency}
                trending={trending}
                dataProvider={dataProvider}
                tradeProvider={tradeProvider}
                showDataProviderIcon={tabIndex < 3}
                showTradeProviderIcon={false}
                dataProviders={dataProviders}
                tradeProviders={tradeProviders}
                TrendingCardProps={{ classes: { root: classes.root } }}>
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
                            classes={{ root: classes.priceChartRoot }}
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
                {tabIndex === 3 && isSwappable ? (
                    <TradeView
                        classes={{ root: classes.tradeViewRoot }}
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
