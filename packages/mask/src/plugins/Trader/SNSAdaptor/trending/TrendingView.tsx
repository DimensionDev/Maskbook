import { useEffect, useMemo, useState, useContext } from 'react'
import { compact, first } from 'lodash-es'
import { TrendingViewContext } from './context.js'
import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import {
    useChainContext,
    useChainIdValid,
    useNonFungibleAssetsByCollection,
    Web3ContextProvider,
} from '@masknet/web3-hooks-base'
import { ChainId, isNativeTokenAddress, isNativeTokenSymbol, SchemaType } from '@masknet/web3-shared-evm'
import { createFungibleToken, SocialIdentity, TokenType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NFTList, PluginCardFrameMini } from '@masknet/shared'
import { EMPTY_LIST, PluginID, NetworkPluginID, getSiteType } from '@masknet/shared-base'
import { makeStyles, MaskLightTheme, MaskTabList, useTabs } from '@masknet/theme'
import { TrendingAPI } from '@masknet/web3-providers/types'
import { TabContext } from '@mui/lab'
import { Stack, Tab, ThemeProvider } from '@mui/material'
import { Box, useTheme } from '@mui/system'
import { useValueRef } from '@masknet/shared-base-ui'
import { useI18N } from '../../../../utils/index.js'
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
import { pluginIDSettings } from '../../../../../shared/legacy-settings/settings.js'
import { PluginEnableBoundary } from '../../../../components/shared/PluginEnableBoundary.js'
import { ContentTabs } from '../../types/index.js'

const useStyles = makeStyles<{
    isTokenTagPopper: boolean
    isCollectionProjectPopper: boolean
    currentTab: ContentTabs
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
                  minHeight: props.currentTab === ContentTabs.Market ? 352 : 374,
                  maxHeight: props.isCollectionProjectPopper
                      ? props.currentTab === ContentTabs.Price
                          ? 450
                          : props.currentTab === ContentTabs.Swap
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
        },
        priceChartWrapper: {
            padding: theme.spacing(4, 2, props.isTokenTagPopper ? 8 : 4, 2),
        },
        nftList: {
            gap: 12,
        },
        hidden: {
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
    const { t } = useI18N()
    const theme = useTheme()
    const isMinimalMode = useIsMinimalMode(PluginID.Trader)
    const isWeb3ProfileMinimalMode = useIsMinimalMode(PluginID.Web3Profile)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM, chainId)

    const site = getSiteType()
    const pluginIDs = useValueRef(pluginIDSettings)
    const context = { pluginID: site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM }

    // #region merge trending
    const { value: { trending } = {}, loading: loadingTrending } = useTrendingById(result, result.address)
    // #endregion

    // #region stats
    const [days, setDays] = useState(TrendingAPI.Days.ONE_WEEK)
    const {
        value: stats = EMPTY_LIST,
        loading: loadingStats,
        retry: retryStats,
    } = usePriceStats({
        coinId: trending?.coin.id,
        dataProvider: trending?.dataProvider,
        currency: trending?.currency,
        days,
    })
    // #endregion
    const isNFT = trending?.coin.type === TokenType.NonFungible

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
        chainIdValid &&
        (!swapExpectedContract?.pluginID || swapExpectedContract?.pluginID === NetworkPluginID.PLUGIN_EVM)
    // #endregion

    // #region tabs
    const tabs = useMemo(() => {
        const list = [ContentTabs.Market, ContentTabs.Price, ContentTabs.Exchange]
        if (isSwappable) list.push(ContentTabs.Swap)
        if (isNFT) list.push(ContentTabs.NFTItems)
        return list
    }, [isSwappable, isNFT])
    const [currentTab, , , setTab] = useTabs<ContentTabs>(tabs[0], ...tabs)
    const tabComponents = useMemo(() => {
        const configs = [
            {
                key: ContentTabs.Market,
                label: t('plugin_trader_tab_market'),
            },
            {
                key: ContentTabs.Price,
                label: t('plugin_trader_trending'),
            },
            {
                key: ContentTabs.Exchange,
                label: isNFT ? t('plugin_trader_tab_activities') : t('plugin_trader_tab_exchange'),
            },
            isSwappable
                ? {
                      key: ContentTabs.Swap,
                      label: t('plugin_trader_tab_swap'),
                  }
                : undefined,
            isNFT
                ? {
                      key: ContentTabs.NFTItems,
                      label: t('plugin_trader_nft_items'),
                  }
                : undefined,
        ]
        return compact(configs).map((x) => <Tab value={x.key} key={x!.key} label={x.label} />)
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

    const { coin, tickers, market } = trending

    const component = (
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
                        onChange={(_, v: ContentTabs) => setTab(v)}
                        aria-label="Network Tabs">
                        {tabComponents}
                    </MaskTabList>
                </Stack>
            </TabContext>
            <Stack sx={{ backgroundColor: theme.palette.maskColor.bottom }}>
                {currentTab === ContentTabs.Market && trending.dataProvider ? (
                    <CoinMarketPanel dataProvider={trending.dataProvider} trending={trending} result={result} />
                ) : null}
                {currentTab === ContentTabs.Price ? (
                    <Box className={classes.priceChartWrapper}>
                        <PriceChart
                            classes={{ root: classes.priceChartRoot }}
                            coin={coin}
                            amount={market?.price_change_percentage_1h ?? market?.price_change_24h ?? 0}
                            currency={trending.currency}
                            stats={stats}
                            retry={retryStats}
                            loading={loadingStats}>
                            <PriceChartDaysControl
                                rangeOptions={DEFAULT_RANGE_OPTIONS}
                                days={days}
                                onDaysChange={setDays}
                            />
                        </PriceChart>
                    </Box>
                ) : null}
                {currentTab === ContentTabs.Exchange && trending.dataProvider ? (
                    <Box p={2}>
                        {isNFT ? (
                            <NonFungibleTickersTable
                                isCollectionProjectPopper={isCollectionProjectPopper}
                                id={
                                    (result.pluginID === NetworkPluginID.PLUGIN_SOLANA ? result.name : coin.address) ??
                                    ''
                                }
                                chainId={result.chainId ?? coin.chainId ?? ChainId.Mainnet}
                                result={result}
                            />
                        ) : (
                            <TickersTable tickers={tickers} dataProvider={trending.dataProvider} />
                        )}
                    </Box>
                ) : null}
                {currentTab === ContentTabs.Swap && isSwappable ? (
                    <Web3ContextProvider
                        value={{
                            pluginID: context.pluginID,
                            chainId: isNativeTokenSymbol(trending.coin.symbol)
                                ? trending.coin.chainId
                                : swapExpectedContract?.chainId,
                        }}>
                        <TradeView
                            classes={{ root: classes.tradeViewRoot }}
                            TraderProps={{
                                defaultInputCoin: coin.address
                                    ? createFungibleToken(
                                          chainId,
                                          isNativeTokenAddress(coin.address) ? SchemaType.Native : SchemaType.ERC20,
                                          coin.address,
                                          coin.name,
                                          coin.symbol,
                                          coin.decimals ?? 0,
                                      )
                                    : undefined,
                                defaultOutputCoin: trending.coin
                                    ? createFungibleToken(
                                          trending.coin.chainId ?? swapExpectedContract?.chainId ?? chainId,
                                          isNativeTokenAddress(
                                              trending.coin.contract_address ?? swapExpectedContract?.address,
                                          )
                                              ? SchemaType.Native
                                              : SchemaType.ERC20,
                                          trending.coin.contract_address ?? swapExpectedContract?.address ?? '',
                                          '',
                                          '',
                                          trending.coin.decimals ?? 0,
                                      )
                                    : undefined,
                            }}
                        />
                    </Web3ContextProvider>
                ) : null}

                {isNFT && (
                    <Box className={cx(classes.nftItems, currentTab === ContentTabs.NFTItems ? '' : classes.hidden)}>
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
                )}
            </Stack>
        </TrendingViewDeck>
    )

    if (isProfilePage && isWeb3ProfileMinimalMode) {
        return (
            <PluginCardFrameMini>
                <ThemeProvider theme={MaskLightTheme}>
                    <PluginEnableBoundary pluginID={PluginID.Web3Profile}>{component}</PluginEnableBoundary>
                </ThemeProvider>
            </PluginCardFrameMini>
        )
    }

    return component
}
