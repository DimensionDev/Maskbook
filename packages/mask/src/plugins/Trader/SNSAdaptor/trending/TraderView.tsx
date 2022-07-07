import { useState, useEffect, useMemo } from 'react'
import { Link, Stack, Tab } from '@mui/material'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { useI18N } from '../../../../utils'
import type { TagType } from '../../types'
import { DataProvider } from '@masknet/public-api'
import { resolveDataProviderName, resolveDataProviderLink } from '../../pipes'
import { useTrendingById, useTrendingByKeyword } from '../../trending/useTrending'
import { TickersTable } from './TickersTable'
import { PriceChart } from './PriceChart'
import { usePriceStats } from '../../trending/usePriceStats'
import { Days, DEFAULT_RANGE_OPTIONS, NFT_RANGE_OPTIONS, PriceChartDaysControl } from './PriceChartDaysControl'
import { useCurrentDataProvider } from '../../trending/useCurrentDataProvider'
import { TradeView } from '../trader/TradeView'
import { CoinMarketPanel } from './CoinMarketPanel'
import { TrendingViewError } from './TrendingViewError'
import { TrendingViewSkeleton } from './TrendingViewSkeleton'
import { TrendingViewDeck } from './TrendingViewDeck'
import { useAvailableCoins } from '../../trending/useAvailableCoins'
import { usePreferredCoinId } from '../../trending/useCurrentCoinId'
import { isNativeTokenSymbol } from '@masknet/web3-shared-evm'
import {
    useChainIdValid,
    useFungibleToken,
    useNetworkType,
    useNonFungibleAssetsByCollection,
} from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { setStorage } from '../../storage'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { Box, useTheme } from '@mui/system'
import { TabContext } from '@mui/lab'
import { EMPTY_LIST } from '@masknet/shared-base'
import { NFTList } from '@masknet/shared'
import { TrendingCoinType } from '@masknet/web3-providers'
import { compact } from 'lodash-unified'

const useStyles = makeStyles<{ isPopper: boolean }>()((theme, props) => {
    return {
        root: props.isPopper
            ? {
                  width: 598,
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
        body: props.isPopper
            ? {
                  minHeight: 303,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'transparent',
              }
            : {
                  background: 'transparent',
              },
        footerSkeleton: props.isPopper
            ? {}
            : {
                  borderBottom: `solid 1px ${theme.palette.divider}`,
              },
        content: props.isPopper
            ? {}
            : {
                  border: 'none',
              },
        tradeViewRoot: {
            maxWidth: '100% !important',
        },
        priceChartRoot: props.isPopper
            ? {
                  flex: 1,
              }
            : {},

        cardHeader: props.isPopper
            ? {
                  marginBottom: '-36px',
              }
            : {
                  marginBottom: '-44px',
              },
        nftItems: {
            height: 530,
            padding: theme.spacing(2),
            boxSizing: 'border-box',
            overflow: 'auto',
        },
        nftList: {
            gap: 12,
        },
    }
})

export interface TraderViewProps {
    name: string
    tagType: TagType
    dataProviders: DataProvider[]
    onUpdate?: () => void
    isPopper?: boolean
}

enum ContentTabs {
    Market = 'market',
    Price = 'price',
    Exchange = 'exchange',
    Swap = 'swap',
    NFTItems = 'nft-items',
}

export function TraderView(props: TraderViewProps) {
    const { name, tagType, dataProviders, isPopper = true } = props

    const { t } = useI18N()
    const { classes } = useStyles({ isPopper })
    const theme = useTheme()
    const dataProvider = useCurrentDataProvider(dataProviders)
    const [tabIndex, setTabIndex] = useState(dataProvider !== DataProvider.UNISWAP_INFO ? 1 : 0)
    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM)
    // #region track network type
    const networkType = useNetworkType(NetworkPluginID.PLUGIN_EVM)
    useEffect(() => setTabIndex(0), [networkType])
    // #endregion

    // #region multiple coins share the same symbol
    const { value: coins = EMPTY_LIST } = useAvailableCoins(tagType, name, dataProvider)
    // #endregion

    // #region merge trending
    const coinId = usePreferredCoinId(name, dataProvider)
    const trendingById = useTrendingById(coinId, dataProvider)
    const trendingByKeyword = useTrendingByKeyword(tagType, coinId ? '' : name, dataProvider)
    const {
        value: { currency, trending },
        error: trendingError,
        loading: loadingTrending,
    } = coinId ? trendingById : trendingByKeyword
    // #endregion

    const coinSymbol = (trending?.coin.symbol || '').toLowerCase()

    // #region swap
    const { value: tokenDetailed } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        coinSymbol === 'eth' ? '' : trending?.coin.contract_address ?? '',
    )
    // #endregion

    // #region stats
    const [days, setDays] = useState(Days.ONE_WEEK)
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

    const isNFT = trending?.coin.type === TrendingCoinType.NonFungible
    // #region if the coin is a native token or contract address exists
    const isSwappable = !isNFT && (!!trending?.coin.contract_address || isNativeTokenSymbol(coinSymbol)) && chainIdValid
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
                label: isNFT ? t('plugin_trader_floor_price') : t('plugin_trader_tab_price'),
            },
            {
                key: ContentTabs.Exchange,
                label: t('plugin_trader_tab_exchange'),
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
    }, [isSwappable, isNFT])
    // #endregion

    // // #region current data provider switcher
    const DataProviderSwitcher = useMemo(() => {
        if (dataProviders.length === 0) return
        if (typeof dataProvider === 'undefined') return dataProviders[0]
        const indexOf = dataProviders.indexOf(dataProvider)
        if (indexOf === -1) return
        const nextOption = indexOf === dataProviders.length - 1 ? dataProviders[0] : dataProviders[indexOf + 1]

        return (
            <ActionButton sx={{ marginTop: 1 }} color="primary" onClick={() => setStorage(nextOption)}>
                Switch to {resolveDataProviderName(nextOption)}
            </ActionButton>
        )
    }, [dataProvider, resolveDataProviderName])
    // // #endregion

    // #region api ready callback
    useEffect(() => {
        props.onUpdate?.()
    }, [tabIndex, loadingTrending])
    // #endregion
    const collectionAddress =
        trending?.coin.type === TrendingCoinType.NonFungible ? trending.coin.contract_address : undefined
    const {
        value: fetchedTokens = EMPTY_LIST,
        done,
        next,
        error: loadError,
    } = useNonFungibleAssetsByCollection(collectionAddress, NetworkPluginID.PLUGIN_EVM)

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

    // #region display loading skeleton
    if (!currency || !trending || loadingTrending)
        return (
            <TrendingViewSkeleton
                classes={{ footer: classes.footerSkeleton }}
                TrendingCardProps={{ classes: { root: classes.root } }}
            />
        )
    // #endregion

    const { coin, tickers } = trending

    return (
        <TrendingViewDeck
            classes={{
                body: classes.body,
                content: classes.content,
                cardHeader: classes.cardHeader,
            }}
            keyword={name}
            stats={stats}
            coins={coins}
            currency={currency}
            trending={trending}
            dataProvider={dataProvider}
            showDataProviderIcon={tabIndex < 3}
            dataProviders={dataProviders}
            TrendingCardProps={{ classes: { root: classes.root } }}>
            <TabContext value={currentTab}>
                <MaskTabList
                    variant="base"
                    classes={{ root: classes.tabListRoot }}
                    onChange={(_, v: ContentTabs) => setTab(v)}
                    aria-label="Network Tabs">
                    {tabComponents}
                </MaskTabList>
            </TabContext>
            <Stack sx={{ backgroundColor: theme.palette.maskColor.bottom }}>
                {currentTab === ContentTabs.Market ? (
                    <CoinMarketPanel dataProvider={dataProvider} trending={trending} />
                ) : null}
                {currentTab === ContentTabs.Price ? (
                    <Box px={2} py={4}>
                        <PriceChart
                            classes={{ root: classes.priceChartRoot }}
                            coin={coin}
                            currency={currency}
                            stats={stats}
                            retry={retryStats}
                            loading={loadingStats}>
                            <PriceChartDaysControl
                                rangeOptions={isNFT ? NFT_RANGE_OPTIONS : DEFAULT_RANGE_OPTIONS}
                                days={days}
                                onDaysChange={setDays}
                            />
                        </PriceChart>
                    </Box>
                ) : null}
                {currentTab === ContentTabs.Exchange ? (
                    <Box p={2}>
                        <TickersTable tickers={tickers} coinType={coin.type} dataProvider={dataProvider} />
                    </Box>
                ) : null}
                {currentTab === ContentTabs.Swap && isSwappable ? (
                    <TradeView
                        classes={{ root: classes.tradeViewRoot }}
                        TraderProps={{
                            coin,
                            tokenDetailed,
                        }}
                    />
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
}
