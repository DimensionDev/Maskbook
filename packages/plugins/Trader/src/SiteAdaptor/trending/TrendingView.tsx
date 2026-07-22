import { Trans } from '@lingui/react/macro'
import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { PluginCardFrameMini, PluginEnableBoundary } from '@masknet/shared'
import { Days, EMPTY_LIST, NetworkPluginID, PluginID, type SocialIdentity } from '@masknet/shared-base'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { makeStyles, MaskTabList, MaskThemeProvider, useTabs } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { TabContext } from '@mui/lab'
import { Box, Stack, Tab, useTheme } from '@mui/material'
import { first } from 'lodash-es'
import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { usePriceStats } from '../../trending/usePriceStats.js'
import { useTrendingById } from '../../trending/useTrending.js'
import { ContentTab } from '../../types/index.js'
import { CoinMarketPanel } from './CoinMarketPanel.js'
import { TrendingViewContext } from './context.js'
import { FailedTrendingView } from './FailedTrendingView.js'
import { PriceChart } from './PriceChart.js'
import { DEFAULT_RANGE_OPTIONS, PriceChartDaysControl } from './PriceChartDaysControl.js'
import { TickersTable } from './TickersTable.js'
import { TrendingViewDeck } from './TrendingViewDeck.js'
import { TrendingViewSkeleton } from './TrendingViewSkeleton.js'

const useStyles = makeStyles<{
    isTokenTagPopper: boolean
    currentTab: ContentTab
}>()((theme, props) => {
    return {
        root:
            props.isTokenTagPopper ?
                {
                    width: 598,
                    borderRadius: theme.spacing(2),
                    boxShadow: 'rgba(101, 119, 134, 0.2) 0 0 15px, rgba(101, 119, 134, 0.15) 0 0 3px 1px',
                    ...theme.applyStyles('dark', {
                        boxShadow: 'rgba(255, 255, 255, 0.2) 0 0 15px, rgba(255, 255, 255, 0.15) 0 0 3px 1px',
                    }),
                }
            :   {
                    width: '100%',
                    boxShadow: 'none',
                    borderRadius: 0,
                    marginBottom: 0,
                },
        tabListRoot: {
            flexGrow: 0,
        },
        body: {
            background: 'transparent',
            maxHeight: props.currentTab === ContentTab.Market ? 374 : 'unset',
            display: 'flex',
            flexDirection: 'column',
        },
        footerSkeleton:
            props.isTokenTagPopper ?
                {}
            :   {
                    borderBottom: `solid 1px ${theme.vars.palette.divider}`,
                },
        content:
            props.isTokenTagPopper ?
                {}
            :   {
                    border: 'none',
                },
        priceChartRoot:
            props.isTokenTagPopper ?
                {
                    flex: 1,
                }
            :   {},
        cardHeader: {
            marginBottom: '-36px',
        },
        priceChartWrapper: {
            padding: theme.spacing(4, 2, props.isTokenTagPopper ? 8 : 4, 2),
        },
    }
})

interface TrendingViewProps {
    resultList: Web3Helper.TokenResultAll[]
    currentResult?: Web3Helper.TokenResultAll
    identity?: SocialIdentity | null
    setActive?: (x: boolean) => void
    onUpdate?: () => void
}

export function TrendingView(props: TrendingViewProps) {
    const { resultList, identity, setActive, currentResult } = props
    const [result = resultList[0], setResult] = useState(currentResult)
    const { isTokenTagPopper, isProfilePage } = useContext(TrendingViewContext)
    const theme = useTheme()
    const isMinimalMode = useIsMinimalMode(PluginID.Trader)
    const isWeb3ProfileMinimalMode = useIsMinimalMode(PluginID.Web3Profile)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    // #region merge trending
    const { value: { trending } = {}, loading: loadingTrending, error } = useTrendingById(result, result.address)
    // #endregion

    useRenderPhraseCallbackOnDepsChange(() => {
        if (!currentResult) return
        setResult(currentResult)
    }, [currentResult])

    // #region stats
    const [days, setDays] = useState(Days.ONE_DAY)
    const [currentPriceChange, setCurrentPriceChange] = useState(
        trending?.market?.price_change_percentage_24h_in_currency,
    )
    const onPriceDaysControlChange = useCallback(
        (days: number) => {
            setDays(days)
            const map: Partial<Record<Days, number | undefined>> = {
                [Days.ONE_DAY]: trending?.market?.price_change_percentage_24h_in_currency,
                [Days.ONE_WEEK]: trending?.market?.price_change_percentage_7d_in_currency,
                [Days.ONE_MONTH]: trending?.market?.price_change_percentage_30d_in_currency,
                [Days.ONE_YEAR]: trending?.market?.price_change_percentage_1y_in_currency,
                [Days.MAX]: trending?.market?.atl_change_percentage,
            }
            setCurrentPriceChange(map[days as Days])
        },
        [trending?.market],
    )

    useRenderPhraseCallbackOnDepsChange(() => {
        onPriceDaysControlChange(Days.ONE_DAY)
    }, [trending?.market])

    const { data: stats = EMPTY_LIST, isPending: loadingStats } = usePriceStats({
        chainId: result.chainId,
        coinId: trending?.coin.id,
        sourceType: trending?.dataProvider,
        currency: trending?.currency,
        days,
    })
    // #endregion

    // #region expected chainId
    const swapExpectedContract = useMemo(() => {
        const contracts = trending?.contracts?.filter((x) => x.chainId && x.address) ?? []
        const fallbackContracts: TrendingAPI.Contract[] =
            trending?.coin.chainId && trending.coin.contract_address ?
                [
                    {
                        chainId: trending.coin.chainId,
                        address: trending.coin.contract_address,
                        pluginID: NetworkPluginID.PLUGIN_EVM,
                    },
                ]
            :   []

        const _contracts = (contracts.length ? contracts : fallbackContracts).filter((x) => x.chainId === chainId) ?? []
        if (_contracts.length > 0) return first(_contracts)
        return first(contracts)
    }, [trending, chainId])
    // #endregion

    // #region if the coin is a native token or contract address exists

    const isBRC20 = trending?.coin.tags?.includes('BRC-20')

    const isSwappable =
        !!process.env.MASK_ENABLE_EXCHANGE &&
        !isMinimalMode &&
        !isBRC20 &&
        !!trending?.coin.contract_address &&
        (!swapExpectedContract?.pluginID || swapExpectedContract.pluginID === NetworkPluginID.PLUGIN_EVM)
    // #endregion

    // #region tabs
    const tabs = useMemo(() => {
        return [ContentTab.Market, ContentTab.Price, ContentTab.Exchange]
    }, [])
    const [currentTab, _a, _b, setTab] = useTabs<ContentTab>(tabs[0], ...tabs)
    useLayoutEffect(() => {
        setTab(tabs[0])
    }, [result, tabs[0]])

    const TabComponents = useMemo(() => {
        const configs = [
            {
                key: ContentTab.Market,
                label: <Trans>General</Trans>,
            },
            {
                key: ContentTab.Price,
                label: <Trans>Price</Trans>,
            },
            {
                key: ContentTab.Exchange,
                label: <Trans>Exchange</Trans>,
            },
        ]
        return configs.map((x) => <Tab value={x.key} key={x.key} label={x.label} />)
    }, [])
    // #endregion

    const { classes } = useStyles({ isTokenTagPopper, currentTab })

    // #region api ready callback
    useEffect(() => {
        props.onUpdate?.()
    }, [loadingTrending])
    // #endregion

    if (error) {
        return (
            <FailedTrendingView
                result={result}
                resultList={resultList}
                setResult={setResult}
                classes={{ root: classes.root }}
            />
        )
    }
    // #region display loading skeleton
    if (!trending?.currency || loadingTrending)
        return (
            <MaskThemeProvider palette="light">
                <TrendingViewSkeleton
                    classes={{ footer: classes.footerSkeleton }}
                    TrendingCardProps={{ classes: { root: classes.root } }}
                />
            </MaskThemeProvider>
        )
    // #endregion

    const { coin, tickers } = trending

    const Component = (
        <TrendingViewDeck
            isSwappable={isSwappable}
            classes={{
                body: classes.body,
                content: classes.content,
                cardHeader: classes.cardHeader,
            }}
            currentTab={currentTab}
            identity={identity}
            setActive={setActive}
            setResult={setResult}
            resultList={resultList}
            result={result}
            currency={trending.currency}
            trending={trending}
            TrendingCardProps={{ classes: { root: classes.root } }}>
            <TabContext value={currentTab}>
                <Stack sx={{ px: 2 }}>
                    <MaskTabList
                        variant="base"
                        classes={{ root: classes.tabListRoot }}
                        onChange={(_, v: ContentTab) => {
                            setTab(v)

                            if (!isProfilePage) return

                            if (v === ContentTab.Price) {
                                Telemetry.captureEvent(EventType.Access, EventID.EntryProfileTokenSwitchTrend)
                            } else if (v === ContentTab.Exchange) {
                                Telemetry.captureEvent(EventType.Access, EventID.EntryProfileTokenSwitchMarket)
                            }
                        }}
                        aria-label="Network Tabs">
                        {TabComponents}
                    </MaskTabList>
                </Stack>
            </TabContext>
            <Stack
                sx={{
                    backgroundColor: isTokenTagPopper ? theme.vars.palette.maskColor.bottom : 'transparent',
                    flexGrow: 1,
                    overflow: 'auto',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                }}>
                {currentTab === ContentTab.Market && trending.dataProvider ?
                    <CoinMarketPanel trending={trending} result={result} />
                :   null}
                {currentTab === ContentTab.Price ?
                    <Box className={classes.priceChartWrapper}>
                        <PriceChart
                            className={classes.priceChartRoot}
                            coin={coin}
                            amount={currentPriceChange ?? trending.market?.price_change_percentage_24h_in_currency ?? 0}
                            currency={trending.currency}
                            stats={stats}
                            loading={loadingStats}>
                            <PriceChartDaysControl
                                rangeOptions={DEFAULT_RANGE_OPTIONS}
                                days={days}
                                onDaysChange={onPriceDaysControlChange}
                            />
                        </PriceChart>
                    </Box>
                :   null}
                {currentTab === ContentTab.Exchange && trending.dataProvider ?
                    <Box sx={{ p: 2 }}>
                        <TickersTable tickers={tickers} />
                    </Box>
                :   null}
            </Stack>
        </TrendingViewDeck>
    )

    if (isProfilePage && isWeb3ProfileMinimalMode) {
        return (
            <PluginCardFrameMini>
                <MaskThemeProvider palette="light">
                    <PluginEnableBoundary pluginID={PluginID.Web3Profile}>{Component}</PluginEnableBoundary>
                </MaskThemeProvider>
            </PluginCardFrameMini>
        )
    }

    return Component
}
