import { useEffect, useMemo, useState } from 'react'
import { compact } from 'lodash-es'
import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import {
    useChainContext,
    useChainIdValid,
    useNonFungibleAssetsByCollection,
    Web3ContextProvider,
} from '@masknet/web3-hooks-base'
import { ChainId, isNativeTokenAddress, isNativeTokenSymbol, SchemaType } from '@masknet/web3-shared-evm'
import { SourceType, createFungibleToken, SearchResultType, TokenType, TokenResult } from '@masknet/web3-shared-base'
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

const useStyles = makeStyles<{
    isTokenTagPopper: boolean
    isNFTProjectPopper: boolean
    currentTab: ContentTabs
}>()((theme, props) => {
    return {
        root:
            props.isTokenTagPopper || props.isNFTProjectPopper
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
        body: props.isNFTProjectPopper
            ? {
                  minHeight: 374,
                  maxHeight: props.isNFTProjectPopper ? (props.currentTab === ContentTabs.Price ? 450 : 374) : 'unset',
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
        priceChartRootWrapper:
            props.isNFTProjectPopper && props.currentTab === ContentTabs.Price ? { height: 420 } : {},
        cardHeader: {
            marginBottom: '-36px',
        },
        nftItems: {
            height: props.isNFTProjectPopper ? 360 : 530,
            padding: theme.spacing(2),
            boxSizing: 'border-box',
            overflow: 'auto',
        },
        nftList: {
            gap: 12,
        },
    }
})

export interface TrendingViewProps {
    setResult: (a: TokenResult<ChainId, SchemaType>) => void
    result: TokenResult<ChainId, SchemaType>
    resultList?: Array<TokenResult<ChainId, SchemaType>>
    isPreciseSearch?: boolean
    isProfilePage?: boolean
    address?: string
    isNFTProjectPopper?: boolean
    searchedContractAddress?: string
    expectedChainId?: ChainId
    onUpdate?: () => void
    isTokenTagPopper?: boolean
}

enum ContentTabs {
    Market = 'market',
    Price = 'price',
    Exchange = 'exchange',
    Swap = 'swap',
    NFTItems = 'nft-items',
}

export function TrendingView(props: TrendingViewProps) {
    const {
        isTokenTagPopper = true,
        isNFTProjectPopper = false,
        isProfilePage = false,
        searchedContractAddress,
        isPreciseSearch,
        expectedChainId,
        resultList,
        result,
        setResult,
    } = props

    const { t } = useI18N()
    const theme = useTheme()
    const isMinimalMode = useIsMinimalMode(PluginID.Trader)
    const isWeb3ProfileMinimalMode = useIsMinimalMode(PluginID.Web3Profile)
    const [tabIndex, setTabIndex] = useState(result.source !== SourceType.UniswapInfo ? 1 : 0)
    const { chainId, networkType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM, chainId)

    const site = getSiteType()
    const pluginIDs = useValueRef(pluginIDSettings)
    const context = { pluginID: site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM }

    // #region track network type
    useEffect(() => setTabIndex(0), [networkType])
    // #endregion
    // #region merge trending
    const { value: { trending } = {}, loading: loadingTrending } = useTrendingById(
        result.type === SearchResultType.FungibleToken
            ? result.id || searchedContractAddress || ''
            : result.address || '',
        result.source,
        expectedChainId,
        searchedContractAddress,
    )
    // #endregion
    const coinSymbol = (trending?.coin.symbol || '').toLowerCase()

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
    // #region if the coin is a native token or contract address exists
    const isSwappable =
        !isMinimalMode &&
        !isNFT &&
        (!!trending?.coin.contract_address || isNativeTokenSymbol(coinSymbol)) &&
        chainIdValid
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

    const { classes } = useStyles({ isTokenTagPopper, isNFTProjectPopper, currentTab })

    // #region api ready callback
    useEffect(() => {
        props.onUpdate?.()
    }, [tabIndex, loadingTrending])
    // #endregion
    const collectionAddress = trending?.coin.type === TokenType.NonFungible ? trending.coin.contract_address : undefined
    const {
        value: fetchedTokens = EMPTY_LIST,
        done,
        next,
        error: loadError,
    } = useNonFungibleAssetsByCollection(collectionAddress, NetworkPluginID.PLUGIN_EVM, {
        chainId: expectedChainId as ChainId,
    })

    // #region display loading skeleton
    if (!trending?.currency || loadingTrending)
        return (
            <ThemeProvider theme={MaskLightTheme}>
                <TrendingViewSkeleton
                    classes={{ footer: classes.footerSkeleton }}
                    TrendingCardProps={{ classes: { root: classes.root } }}
                    isNFTProjectPopper={isNFTProjectPopper}
                    isProfilePage={isProfilePage}
                    isTokenTagPopper={isTokenTagPopper}
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
            stats={stats}
            setResult={setResult}
            resultList={resultList}
            result={result}
            isPreciseSearch={isPreciseSearch}
            isProfilePage={isProfilePage}
            isNFTProjectPopper={isNFTProjectPopper}
            currency={trending.currency}
            trending={trending}
            isTokenTagPopper={isTokenTagPopper}
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
                    <CoinMarketPanel dataProvider={trending.dataProvider} trending={trending} />
                ) : null}
                {currentTab === ContentTabs.Price ? (
                    <Box px={2} py={4} height={420} className={classes.priceChartRootWrapper}>
                        <PriceChart
                            classes={{ root: classes.priceChartRoot }}
                            coin={coin}
                            amount={market?.price_change_percentage_1h ?? market?.price_change_percentage_24h ?? 0}
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
                                isNFTProjectPopper={isNFTProjectPopper}
                                address={coin.address ?? ''}
                                chainId={coin.chainId ?? ChainId.Mainnet}
                            />
                        ) : (
                            <TickersTable tickers={tickers} dataProvider={trending.dataProvider} />
                        )}
                    </Box>
                ) : null}
                {currentTab === ContentTabs.Swap && isSwappable ? (
                    <Web3ContextProvider value={context}>
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
                            }}
                        />
                    </Web3ContextProvider>
                ) : null}
                {currentTab === ContentTabs.NFTItems && isNFT ? (
                    <Box className={classes.nftItems}>
                        <NFTList
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
                    <PluginEnableBoundary pluginID={PluginID.Web3Profile}>{component}</PluginEnableBoundary>
                </ThemeProvider>
            </PluginCardFrameMini>
        )
    }

    return component
}
