import React, { useState } from 'react'
import { makeStyles, createStyles, Tab, Tabs, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useChainId } from '../../../web3/hooks/useBlockNumber'
import { useFetchPool } from '../hooks/usePool'
import { PoolViewDeck } from './PoolViewDeck'
import { PoolStats } from './PoolStats'

const useStyles = makeStyles((theme) => {
    return createStyles({
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
        body: {},
        footer: {
            borderTop: `solid 1px ${theme.palette.divider}`,
            borderBottom: `solid 1px ${theme.palette.divider}`,
        },
        skeletonFooter: {
            borderBottom: `solid 1px ${theme.palette.divider}`,
        },
        content: {
            padding: 0,
            border: 'none',
        },
        tabs: {
            borderTop: `solid 1px ${theme.palette.divider}`,
            borderBottom: `solid 1px ${theme.palette.divider}`,
            width: '100%',
            minHeight: 'unset',
        },
        tab: {
            minHeight: 'unset',
            minWidth: 'unset',
        },
    })
})

interface PoolViewProps {
    address: string
}

export function PoolView(props: PoolViewProps) {
    const { address } = props

    const { t } = useI18N()
    const classes = useStyles()

    const chainId = useChainId()
    const [tabIndex, setTabIndex] = useState(0)

    //#region fetch pool
    const { value: pool, error, loading } = useFetchPool(props.address)
    //#endregion

    // //#region merge trending
    // const coinId = usePreferredCoinId(name, dataProvider)
    // const trendingById = useTrendingById(coinId, dataProvider)
    // const trendingByKeyword = useTrendingByKeyword(tagType, coinId ? '' : name, dataProvider)
    // const {
    //     value: { currency, trending },
    //     error: trendingError,
    //     loading: loadingTrending,
    // } = coinId ? trendingById : trendingByKeyword
    // //#endregion

    // //#region swap
    // const { value: tokenDetailed, error: tokenDetailedError, loading: loadingTokenDetailed } = useTokenDetailed(
    //     trending?.coin.symbol.toLowerCase() === 'eth' ? EthereumTokenType.Ether : EthereumTokenType.ERC20,
    //     trending?.coin.symbol.toLowerCase() === 'eth' ? '' : trending?.coin.eth_address ?? '',
    // )
    // const tradeProvider = useCurrentTradeProvider(tradeProviders)
    // //#endregion

    // //#region stats
    // const [days, setDays] = useState(Days.ONE_WEEK)
    // const { value: stats = [], loading: loadingStats, retry: retryStats } = usePriceStats({
    //     coinId: trending?.coin.id,
    //     dataProvider: trending?.dataProvider,
    //     currency: trending?.currency,
    //     days,
    // })
    // //#endregion

    // //#region LBP
    // const LBP = useLBP(tokenDetailed?.type === EthereumTokenType.ERC20 ? tokenDetailed : undefined)
    // //#endregion

    // //#region trader context
    // const tradeContext = useTradeContext(tradeProvider)
    // //#endregion

    // //#region current data provider switcher
    // const DataProviderSwitcher = useSettingsSwticher(
    //     currentTrendingDataProviderSettings,
    //     dataProviders,
    //     resolveDataProviderName,
    // )
    // //#endregion

    // //#region no available providers
    // if (dataProviders.length === 0) return null
    // //#endregion

    // //#region error handling
    // // error: unknown coin or api error
    // if (trendingError)
    //     return (
    //         <TrendingViewError
    //             message={
    //                 <span>
    //                     Fail to load trending info from{' '}
    //                     <Link
    //                         color="primary"
    //                         target="_blank"
    //                         rel="noopener noreferrer"
    //                         href={resolveDataProviderLink(dataProvider)}>
    //                         {resolveDataProviderName(dataProvider)}
    //                     </Link>
    //                     .
    //                 </span>
    //             }
    //             reaction={DataProviderSwitcher}
    //             TrendingCardProps={{ classes: { root: classes.root } }}
    //         />
    //     )
    // //#endregion

    // //#region display loading skeleton
    // const isEthereum = !!trending?.coin.eth_address || trending?.coin.symbol.toLowerCase() === 'eth'
    // if (!currency || !trending || (isEthereum && !tokenDetailed) || loadingTrending || loadingTokenDetailed)
    //     return (
    //         <TrendingViewSkeleton
    //             classes={{ footer: classes.skeletonFooter }}
    //             TrendingCardProps={{ classes: { root: classes.root } }}
    //         />
    //     )
    // //#endregion

    //#region tabs
    // const { coin, market, tickers } = trending
    const tabs = [
        <Tab className={classes.tab} key="stats" label={t('plugin_dhedge_tab_stats')} />,
        <Tab className={classes.tab} key="buy" label={t('plugin_dhedge_tab_buy')} />,
        <Tab className={classes.tab} key="chart" label={t('plugin_dhedge_tab_chart')} />,
    ].filter(Boolean)
    //#endregion
    if (!pool) return <Typography>Something went wrong.</Typography>
    return (
        <div>
            <PoolViewDeck pool={pool} />
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
            {tabIndex === 0 ? <PoolStats pool={pool} /> : null}

            {/* // stats={stats}
            // coins={coins}
            // currency={currency}
            // trending={trending}
            // dataProvider={dataProvider}
            // tradeProvider={tradeProvider}
            // showDataProviderIcon={tabIndex < 3}
            // showTradeProviderIcon={tabIndex === 3}
            // TrendingCardProps={{ classes: { root: classes.root } }}
            // dataProviders={dataProviders}
            // tradeProviders={tradeProviders}>


            //     {tabIndex === 2 ? <TickersTable tickers={tickers} dataProvider={dataProvider} /> : null}
            //     {tabIndex === 3 && isEthereum ? (
            //         <TradeView
            //             TraderProps={{
            //                 coin,
            //                 tokenDetailed,
            //             }}
            //         />
            //     ) : null}
            //     {Flags.LBP_enabled && LBP && tabIndex === tabs.length - 1 ? (
            //         <LBPPanel
            //             duration={LBP.duration}
            //             currency={currency}
            //             token={createERC20Token(
            //                 chainId,
            //                 LBP.token.address,
            //                 LBP.token.decimals,
            //                 LBP.token.name ?? '',
            //                 LBP.token.symbol ?? '',
            //             )}
            //         />
            //     ) : null} */}
        </div>
    )
}
