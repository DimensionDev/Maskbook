import { useEffect, useMemo, useState, useContext, useCallback, useLayoutEffect } from 'react'
import { compact, first } from 'lodash-es'
import { TabContext } from '@mui/lab'
import { Box, useTheme } from '@mui/system'
import { Stack, Tab, ThemeProvider } from '@mui/material'
import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import {
    useChainContext,
    useNativeToken,
    useNonFungibleAssetsByCollection,
    Web3ContextProvider,
} from '@masknet/web3-hooks-base'
import { ChainId, isNativeTokenAddress, isNativeTokenSymbol, SchemaType } from '@masknet/web3-shared-evm'
import { createFungibleToken, SourceType, TokenType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NFTList, PluginCardFrameMini, PluginEnableBoundary } from '@masknet/shared'
import {
    EMPTY_LIST,
    PluginID,
    NetworkPluginID,
    getSiteType,
    type SocialIdentity,
    pluginIDsSettings,
    Days,
} from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { makeStyles, MaskLightTheme, MaskTabList, useTabs } from '@masknet/theme'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType, EventID } from '@masknet/web3-telemetry/types'
import { TrendingViewContext } from './context.js'
import { usePriceStats } from '../../trending/usePriceStats.js'
import { useTrendingById } from '../../trending/useTrending.js'
import { TradeView } from '../trader/TradeView.js'
import { CoinMarketPanel } from './CoinMarketPanel.js'
import { PriceChart } from './PriceChart.js'
import { DEFAULT_RANGE_OPTIONS, PriceChartDaysControl } from './PriceChartDaysControl.js'
import { TickersTable } from './TickersTable.js'
import { TrendingViewDeck } from './TrendingViewDeck.js'
import { NonFungibleTickersTable } from './NonFungibleTickersTable.js'
import { TrendingViewSkeleton } from './TrendingViewSkeleton.js'
import { ContentTab } from '../../types/index.js'
import { FailedTrendingView } from './FailedTrendingView.js'
import { useI18N } from '../../locales/index.js'

const useStyles = makeStyles<{
    isTokenTagPopper: boolean
    isCollectionProjectPopper: boolean
    currentTab: ContentTab
}>()((theme, props) => {
    return {
        root:
            props.isTokenTagPopper || props.isCollectionProjectPopper
                ? {
                      width: 598,
                      borderRadius: theme.spacing(2),
                      boxShadow:
                          theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.2) 0 0 15px, rgba(255, 255, 255, 0.15) 0 0 3px 1px'
                              : 'rgba(101, 119, 134, 0.2) 0 0 15px, rgba(101, 119, 134, 0.15) 0 0 3px 1px',
                  }
                : {
                      width: '100%',
                      boxShadow: 'none',
                      borderRadius: 0,
                      marginBottom: 0,
                  },
        tabListRoot: {
            flexGrow: 0,
        },
        body: props.isCollectionProjectPopper
            ? {
                  minHeight: 374,
                  maxHeight: props.isCollectionProjectPopper
                      ? props.currentTab === ContentTab.Price
                          ? 450
                          : props.currentTab === ContentTab.Swap
                          ? 'unset'
                          : 374
                      : 'unset',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'transparent',
              }
            : {
                  background: 'transparent',
                  maxHeight: props.currentTab === ContentTab.Market ? 374 : 'unset',
              },
        footerSkeleton: props.isTokenTagPopper
            ? {}
            : {
                  borderBottom: `solid 1px ${theme.palette.divider}`,
              },
        content: props.isTokenTagPopper
            ? {}
            : {
                  border: 'none',
              },
        tradeViewRoot: {
            maxWidth: '100% !important',
        },
        priceChartRoot: props.isTokenTagPopper
            ? {
                  flex: 1,
              }
            : {},
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
        hidden: {
            padding: 0,
            visibility: 'hidden',
            height: 0,
        },
    }
})

export interface TrendingViewProps {
    resultList: Web3Helper.TokenResultAll[]
    currentResult?: Web3Helper.TokenResultAll
    identity?: SocialIdentity
    setActive?: (x: boolean) => void
    address?: string
    onUpdate?: () => void
}

export function TrendingView(props: TrendingViewProps) {
    const { resultList, identity, setActive, currentResult } = props
    const [result, setResult] = useState(currentResult ?? resultList[0])
    const { isTokenTagPopper, isCollectionProjectPopper, isProfilePage } = useContext(TrendingViewContext)
    const t = useI18N()
    const theme = useTheme()
    const isMinimalMode = useIsMinimalMode(PluginID.Trader)
    const isWeb3ProfileMinimalMode = useIsMinimalMode(PluginID.Web3Profile)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const { data: nativeToken } = useNativeToken<'all'>(NetworkPluginID.PLUGIN_EVM, {
        chainId: result.chainId ?? chainId,
    })

    const site = getSiteType()
    const pluginIDs = useValueRef(pluginIDsSettings)
    const context = { pluginID: site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM }

    // #region merge trending
    const { value: { trending } = {}, loading: loadingTrending, error } = useTrendingById(result, result.address)
    // #endregion

    useEffect(() => {
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
        [JSON.stringify(trending?.market)],
    )

    useEffect(() => {
        onPriceDaysControlChange(Days.ONE_DAY)
    }, [JSON.stringify(trending?.market)])

    const isNFT = trending?.coin.type === TokenType.NonFungible
    const {
        value: stats = EMPTY_LIST,
        loading: loadingStats,
        retry: retryStats,
    } = usePriceStats({
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
            trending?.coin.chainId && trending.coin.contract_address
                ? [
                      {
                          chainId: trending.coin.chainId,
                          address: trending.coin.contract_address,
                          pluginID: NetworkPluginID.PLUGIN_EVM,
                      },
                  ]
                : []

        const _contracts = (contracts.length ? contracts : fallbackContracts).filter((x) => x.chainId === chainId) ?? []
        if (_contracts.length > 0) return first(_contracts)
        return first(contracts)
    }, [trending, chainId])
    // #endregion

    // #region if the coin is a native token or contract address exists
    const isSwappable =
        !isMinimalMode &&
        !isNFT &&
        !!trending?.coin.contract_address &&
        (!swapExpectedContract?.pluginID || swapExpectedContract?.pluginID === NetworkPluginID.PLUGIN_EVM)
    // #endregion

    // #region tabs
    const tabs = useMemo(() => {
        const list = [ContentTab.Market, ContentTab.Price, ContentTab.Exchange]
        if (isSwappable) list.push(ContentTab.Swap)
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
                label: t.plugin_trader_tab_market(),
            },
            {
                key: ContentTab.Price,
                label: t.plugin_trader_trending(),
            },
            {
                key: ContentTab.Exchange,
                label: isNFT ? t.plugin_trader_tab_activities() : t.plugin_trader_tab_exchange(),
            },
            isSwappable
                ? {
                      key: ContentTab.Swap,
                      label: t.plugin_trader_tab_swap(),
                  }
                : undefined,
            isNFT
                ? {
                      key: ContentTab.NFTItems,
                      label: t.plugin_trader_nft_items(),
                  }
                : undefined,
        ]
        return compact(configs).map((x) => <Tab value={x.key} key={x.key} label={x.label} />)
    }, [t, isSwappable, isNFT])
    // #endregion

    const { classes, cx } = useStyles({ isTokenTagPopper, isCollectionProjectPopper, currentTab })

    // #region api ready callback
    useEffect(() => {
        props.onUpdate?.()
    }, [loadingTrending])
    // #endregion

    const collectionId =
        trending?.coin.type === TokenType.NonFungible
            ? result.pluginID === NetworkPluginID.PLUGIN_SOLANA
                ? result.name
                : trending.coin.contract_address
            : undefined
    const {
        value: fetchedTokens = EMPTY_LIST,
        done,
        next,
        error: loadError,
    } = useNonFungibleAssetsByCollection(collectionId, result.pluginID, {
        chainId: result.chainId,
    })

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
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                }}>
                {currentTab === ContentTab.Market && trending.dataProvider ? (
                    <CoinMarketPanel trending={trending} result={result} />
                ) : null}
                {currentTab === ContentTab.Price ? (
                    <Box className={classes.priceChartWrapper}>
                        <PriceChart
                            classes={{ root: classes.priceChartRoot }}
                            coin={coin}
                            amount={
                                currentPriceChange ?? trending?.market?.price_change_percentage_24h_in_currency ?? 0
                            }
                            currency={trending.currency}
                            stats={stats}
                            retry={retryStats}
                            loading={loadingStats}>
                            <PriceChartDaysControl
                                rangeOptions={DEFAULT_RANGE_OPTIONS}
                                days={days}
                                onDaysChange={onPriceDaysControlChange}
                            />
                        </PriceChart>
                    </Box>
                ) : null}
                {currentTab === ContentTab.Exchange && trending.dataProvider ? (
                    <Box p={2}>
                        {isNFT ? (
                            <NonFungibleTickersTable
                                id={
                                    (result.pluginID === NetworkPluginID.PLUGIN_SOLANA ? result.name : coin.address) ??
                                    ''
                                }
                                chainId={result.chainId ?? coin.chainId ?? ChainId.Mainnet}
                                result={result}
                            />
                        ) : (
                            <TickersTable tickers={tickers} />
                        )}
                    </Box>
                ) : null}
                {currentTab === ContentTab.Swap && isSwappable ? (
                    <Web3ContextProvider
                        value={{
                            pluginID: context.pluginID,
                            chainId: isNativeTokenSymbol(coin.symbol) ? coin.chainId : swapExpectedContract?.chainId,
                        }}>
                        <TradeView
                            classes={{ root: classes.tradeViewRoot }}
                            TraderProps={{
                                defaultInputCoin: createFungibleToken(
                                    result.chainId,
                                    SchemaType.Native,
                                    nativeToken?.address ?? '',
                                    nativeToken?.name ?? '',
                                    nativeToken?.symbol ?? '',
                                    nativeToken?.decimals ?? 0,
                                    isNativeTokenAddress(result.address) ? result.logoURL : undefined,
                                ),
                                defaultOutputCoin: isNativeTokenAddress(coin.contract_address)
                                    ? undefined
                                    : createFungibleToken(
                                          swapExpectedContract?.chainId as ChainId,
                                          SchemaType.ERC20,
                                          swapExpectedContract?.address || '',
                                          coin.name ?? coin.name,
                                          coin.symbol ?? coin.symbol ?? '',
                                          coin.decimals ?? 0,
                                          result.logoURL,
                                      ),
                            }}
                        />
                    </Web3ContextProvider>
                ) : null}

                {isNFT ? (
                    <Box className={cx(classes.nftItems, currentTab === ContentTab.NFTItems ? '' : classes.hidden)}>
                        <NFTList
                            pluginID={result.pluginID}
                            className={classes.nftList}
                            tokens={fetchedTokens}
                            onNextPage={next}
                            finished={done}
                            hasError={!!loadError}
                            gap={16}
                        />
                    </Box>
                ) : null}
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
