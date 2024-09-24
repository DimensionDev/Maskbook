import { useEffect, useMemo, useState, useContext, useCallback, useLayoutEffect } from 'react'
import { compact, first } from 'lodash-es'
import { TabContext } from '@mui/lab'
import { Box, useTheme } from '@mui/system'
import { Stack, Tab, ThemeProvider } from '@mui/material'
import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { useChainContext } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { SourceType, TokenType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NFTList, PluginCardFrameMini, PluginEnableBoundary } from '@masknet/shared'
import { EMPTY_LIST, PluginID, NetworkPluginID, type SocialIdentity, Days } from '@masknet/shared-base'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { makeStyles, MaskLightTheme, MaskTabList, useTabs } from '@masknet/theme'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import { TrendingViewContext } from './context.js'
import { usePriceStats } from '../../trending/usePriceStats.js'
import { useTrendingById } from '../../trending/useTrending.js'
import { CoinMarketPanel } from './CoinMarketPanel.js'
import { PriceChart } from './PriceChart.js'
import { DEFAULT_RANGE_OPTIONS, PriceChartDaysControl } from './PriceChartDaysControl.js'
import { TickersTable } from './TickersTable.js'
import { TrendingViewDeck } from './TrendingViewDeck.js'
import { NonFungibleTickersTable } from './NonFungibleTickersTable.js'
import { TrendingViewSkeleton } from './TrendingViewSkeleton.js'
import { ContentTab } from '../../types/index.js'
import { FailedTrendingView } from './FailedTrendingView.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles<{
    isTokenTagPopper: boolean
    isCollectionProjectPopper: boolean
    currentTab: ContentTab
}>()((theme, props) => {
    return {
        root:
            props.isTokenTagPopper || props.isCollectionProjectPopper ?
                {
                    width: 598,
                    borderRadius: theme.spacing(2),
                    boxShadow:
                        theme.palette.mode === 'dark' ?
                            'rgba(255, 255, 255, 0.2) 0 0 15px, rgba(255, 255, 255, 0.15) 0 0 3px 1px'
                        :   'rgba(101, 119, 134, 0.2) 0 0 15px, rgba(101, 119, 134, 0.15) 0 0 3px 1px',
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
        body:
            props.isCollectionProjectPopper ?
                {
                    minHeight: 374,
                    maxHeight:
                        props.isCollectionProjectPopper ?
                            props.currentTab === ContentTab.Price ?
                                450
                            :   374
                        :   'unset',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'transparent',
                }
            :   {
                    background: 'transparent',
                    maxHeight: props.currentTab === ContentTab.Market ? 374 : 'unset',
                    display: 'flex',
                    flexDirection: 'column',
                },
        footerSkeleton:
            props.isTokenTagPopper ?
                {}
            :   {
                    borderBottom: `solid 1px ${theme.palette.divider}`,
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
        nftItems: {
            height: props.isCollectionProjectPopper ? 360 : 530,
            padding: theme.spacing(2),
            boxSizing: 'border-box',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        priceChartWrapper: {
            padding: theme.spacing(4, 2, props.isTokenTagPopper ? 8 : 4, 2),
        },
        nftList: {
            gap: 12,
        },
    }
})

interface TrendingViewProps {
    resultList: Web3Helper.TokenResultAll[]
    currentResult?: Web3Helper.TokenResultAll
    identity?: SocialIdentity | null
    setActive?: (x: boolean) => void
    address?: string
    onUpdate?: () => void
}

export function TrendingView(props: TrendingViewProps) {
    const { resultList, identity, setActive, currentResult } = props
    const [result, setResult] = useState(currentResult ?? resultList[0])
    const { isTokenTagPopper, isCollectionProjectPopper, isProfilePage } = useContext(TrendingViewContext)
    const theme = useTheme()
    const isMinimalMode = useIsMinimalMode(PluginID.Trader)
    const isWeb3ProfileMinimalMode = useIsMinimalMode(PluginID.Web3Profile)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    // #region merge trending
    const { value: { trending } = {}, loading: loadingTrending, error } = useTrendingById(result, result.address)
    // #endregion

    useRenderPhraseCallbackOnDepsChange(() => {
        if (currentResult) setResult(currentResult)
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

    const isNFT = trending?.coin.type === TokenType.NonFungible
    const { data: stats = EMPTY_LIST, isPending: loadingStats } = usePriceStats({
        chainId: result.chainId,
        coinId: trending?.coin.id,
        sourceType: isNFT ? SourceType.NFTScan : trending?.dataProvider,
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
        !isMinimalMode &&
        !isNFT &&
        !isBRC20 &&
        !!trending?.coin.contract_address &&
        (!swapExpectedContract?.pluginID || swapExpectedContract.pluginID === NetworkPluginID.PLUGIN_EVM)
    // #endregion

    // #region tabs
    const tabs = useMemo(() => {
        const list = [ContentTab.Market, ContentTab.Price, ContentTab.Exchange]
        if (isNFT) list.push(ContentTab.NFTItems)
        return list
    }, [isSwappable, isNFT])
    const [currentTab, , , setTab] = useTabs<ContentTab>(tabs[0], ...tabs)
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
                label: isNFT ? <Trans>Floor Price</Trans> : <Trans>Price</Trans>,
            },
            {
                key: ContentTab.Exchange,
                label: isNFT ? <Trans>Activities</Trans> : <Trans>Exchange</Trans>,
            },
            isNFT ?
                {
                    key: ContentTab.NFTItems,
                    label: <Trans>NFTs</Trans>,
                }
            :   undefined,
        ]
        return compact(configs).map((x) => <Tab value={x.key} key={x.key} label={x.label} />)
    }, [isSwappable, isNFT])
    // #endregion

    const { classes } = useStyles({ isTokenTagPopper, isCollectionProjectPopper, currentTab })

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
    const collectionId =
        trending?.coin.type === TokenType.NonFungible ?
            result.pluginID === NetworkPluginID.PLUGIN_SOLANA ?
                result.name
            :   trending.coin.contract_address
        :   undefined

    // #region display loading skeleton
    if (!trending?.currency || loadingTrending)
        return (
            <ThemeProvider theme={MaskLightTheme}>
                <TrendingViewSkeleton
                    classes={{ footer: classes.footerSkeleton }}
                    TrendingCardProps={{ classes: { root: classes.root } }}
                />
            </ThemeProvider>
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
            stats={stats}
            identity={identity}
            setActive={setActive}
            setResult={setResult}
            resultList={resultList}
            result={result}
            currency={trending.currency}
            trending={trending}
            TrendingCardProps={{ classes: { root: classes.root } }}>
            <TabContext value={currentTab}>
                <Stack px={2}>
                    <MaskTabList
                        variant="base"
                        classes={{ root: classes.tabListRoot }}
                        onChange={(_, v: ContentTab) => {
                            setTab(v)

                            if (!isProfilePage) return

                            if (isNFT) {
                                if (v === ContentTab.Price) {
                                    Telemetry.captureEvent(EventType.Access, EventID.EntryProfileNFT_TrendSwitchTo)
                                } else if (v === ContentTab.NFTItems) {
                                    Telemetry.captureEvent(EventType.Access, EventID.EntryProfileNFT_ItemsSwitchTo)
                                } else if (v === ContentTab.Exchange) {
                                    Telemetry.captureEvent(EventType.Access, EventID.EntryProfileNFT_ActivitiesSwitchTo)
                                }
                            } else {
                                if (v === ContentTab.Price) {
                                    Telemetry.captureEvent(EventType.Access, EventID.EntryProfileTokenSwitchTrend)
                                } else if (v === ContentTab.Exchange) {
                                    Telemetry.captureEvent(EventType.Access, EventID.EntryProfileTokenSwitchMarket)
                                }
                            }
                        }}
                        aria-label="Network Tabs">
                        {TabComponents}
                    </MaskTabList>
                </Stack>
            </TabContext>
            <Stack
                sx={{
                    backgroundColor:
                        isTokenTagPopper || isCollectionProjectPopper ? theme.palette.maskColor.bottom : 'transparent',
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
                            classes={{ root: classes.priceChartRoot }}
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
                    <Box p={2}>
                        {isNFT ?
                            <NonFungibleTickersTable
                                id={
                                    (result.pluginID === NetworkPluginID.PLUGIN_SOLANA ? result.name : coin.address) ??
                                    ''
                                }
                                chainId={result.chainId ?? coin.chainId ?? ChainId.Mainnet}
                                result={result}
                            />
                        :   <TickersTable tickers={tickers} />}
                    </Box>
                :   null}
                {isNFT && currentTab === ContentTab.NFTItems ?
                    <Box className={classes.nftItems}>
                        <NFTList
                            pluginID={result.pluginID}
                            chainId={result.chainId}
                            className={classes.nftList}
                            collectionId={collectionId}
                            gap={16}
                        />
                    </Box>
                :   null}
            </Stack>
        </TrendingViewDeck>
    )

    if (isProfilePage && isWeb3ProfileMinimalMode) {
        return (
            <PluginCardFrameMini>
                <ThemeProvider theme={MaskLightTheme}>
                    <PluginEnableBoundary pluginID={PluginID.Web3Profile}>{Component}</PluginEnableBoundary>
                </ThemeProvider>
            </PluginCardFrameMini>
        )
    }

    return Component
}
