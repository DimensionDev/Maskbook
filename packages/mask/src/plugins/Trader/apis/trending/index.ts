import { first, groupBy, uniq } from 'lodash-unified'
import type { Coin, CommunityUrls, Currency, Stat, TagType, Trending } from '../../types'
import { DataProvider } from '@masknet/public-api'
import * as coinGeckoAPI from '../coingecko'
import * as uniswapAPI from '../uniswap'
import { getEnumAsArray, unreachable } from '@dimensiondev/kit'
import { BTC_FIRST_LEGER_DATE, CRYPTOCURRENCY_MAP_EXPIRES_AT } from '../../constants'
import {
    isBlockedId,
    isBlockedKeyword,
    isMirroredKeyword,
    resolveAlias,
    resolveChainId,
    resolveCoinAddress,
    resolveCoinId,
} from './hotfix'
import { ChainId, chainResolver, NetworkType } from '@masknet/web3-shared-evm'
import { Days } from '../../SNSAdaptor/trending/PriceChartDaysControl'
import { CoinMarketCap } from '@masknet/web3-providers'

/**
 * Get supported currencies of specific data provider
 * @param dataProvider
 */
export async function getCurrencies(dataProvider: DataProvider): Promise<Currency[]> {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            const currencies = await coinGeckoAPI.getAllCurrencies()
            return currencies.map((x) => ({
                id: x,
                name: x.toUpperCase(),
            }))
        case DataProvider.COIN_MARKET_CAP:
            return Object.values(CoinMarketCap.getCurrencies()).map((x) => ({
                id: String(x.id),
                name: x.symbol.toUpperCase(),
                symbol: x.token,
                description: x.name,
            }))
        case DataProvider.UNISWAP_INFO:
            return [
                {
                    id: 'usd',
                    name: 'USD',
                    symbol: '$',
                    description: 'Unite State Dollar',
                },
            ]
        default:
            unreachable(dataProvider)
    }
}

export async function getCoins(dataProvider: DataProvider): Promise<Coin[]> {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            return coinGeckoAPI.getAllCoins()
        case DataProvider.COIN_MARKET_CAP:
            return CoinMarketCap.getCoins()
        case DataProvider.UNISWAP_INFO:
            // the uniswap has got huge tokens based (more than 2.2k) since we fetch coin info dynamically
            return []
        default:
            unreachable(dataProvider)
    }
}

// #region check a specific coin is available on specific data provider
const coinNamespace = new Map<
    DataProvider,
    {
        // all of supported symbols
        supportedSymbolsSet: Set<string>

        // get all supported coins by symbol
        supportedSymbolIdsMap: Map<string, Coin[]>
        lastUpdated: Date
    }
>()

async function updateCache(chainId: ChainId, dataProvider: DataProvider, keyword?: string) {
    try {
        // uniswap update cache with keyword
        if (dataProvider === DataProvider.UNISWAP_INFO) {
            if (!keyword) return
            if (!coinNamespace.has(dataProvider))
                coinNamespace.set(dataProvider, {
                    supportedSymbolsSet: new Set(),
                    supportedSymbolIdsMap: new Map(),
                    lastUpdated: new Date(),
                })
            const cache = coinNamespace.get(dataProvider)!
            const coins = (await uniswapAPI.getAllCoinsByKeyword(chainId, keyword)).filter(
                (x) => !isBlockedId(chainId, x.id, dataProvider),
            )
            if (coins.length) {
                cache.supportedSymbolsSet.add(keyword.toLowerCase())
                cache.supportedSymbolIdsMap.set(keyword.toLowerCase(), coins)
                cache.lastUpdated = new Date()
            }
            return
        }

        // other providers fetch all of supported coins
        const coins = (await getCoins(dataProvider)).filter((x) => !isBlockedId(chainId, x.id, dataProvider))
        const coinsGrouped = groupBy(coins, (x) => x.symbol.toLowerCase())
        coinNamespace.set(dataProvider, {
            supportedSymbolsSet: new Set<string>(Object.keys(coinsGrouped)),
            supportedSymbolIdsMap: new Map(Object.entries(coinsGrouped).map(([symbol, coins]) => [symbol, coins])),
            lastUpdated: new Date(),
        })
    } catch {
        console.error('failed to update cache')
    }
}

function isCacheExpired(dataProvider: DataProvider) {
    const lastUpdated = coinNamespace.get(dataProvider)?.lastUpdated.getTime() ?? 0
    return Date.now() - lastUpdated > CRYPTOCURRENCY_MAP_EXPIRES_AT
}

function getCommunityLink(links: string[]): CommunityUrls {
    return links.map((x) => {
        if (x.includes('twitter')) return { type: 'twitter', link: x }
        if (x.includes('t.me')) return { type: 'telegram', link: x }
        if (x.includes('facebook')) return { type: 'facebook', link: x }
        if (x.includes('discord')) return { type: 'discord', link: x }
        if (x.includes('reddit')) return { type: 'reddit', link: x }
        return { type: 'other', link: x }
    })
}

export async function checkAvailabilityOnDataProvider(
    chainId: ChainId,
    keyword: string,
    type: TagType,
    dataProvider: DataProvider,
) {
    if (isBlockedKeyword(type, keyword)) return false
    // for uniswap we check availability by fetching token info dynamically
    if (dataProvider === DataProvider.UNISWAP_INFO) await updateCache(chainId, dataProvider, keyword)
    // cache never built before update in blocking way
    else if (!coinNamespace.has(dataProvider)) await updateCache(chainId, dataProvider)
    // data fetched before update in non-blocking way
    else if (isCacheExpired(dataProvider)) updateCache(chainId, dataProvider)
    const symbols = coinNamespace.get(dataProvider)?.supportedSymbolsSet
    return symbols?.has(resolveAlias(chainId, keyword, dataProvider).toLowerCase()) ?? false
}

export async function getAvailableDataProviders(chainId: ChainId, type?: TagType, keyword?: string) {
    const networkType = chainResolver.chainNetworkType(chainId)
    const isMainnet = chainResolver.isMainnet(chainId)
    if (!isMainnet) return []
    if (!type || !keyword)
        return getEnumAsArray(DataProvider)
            .filter((x) => (isMainnet ? true : x.value !== DataProvider.UNISWAP_INFO))
            .map((y) => y.value)
    const checked = await Promise.all(
        getEnumAsArray(DataProvider)
            .filter((x) => (x.value === DataProvider.UNISWAP_INFO ? networkType === NetworkType.Ethereum : true))
            .map(
                async (x) =>
                    [
                        x.value,
                        await checkAvailabilityOnDataProvider(
                            chainId,
                            resolveAlias(chainId, keyword, x.value),
                            type,
                            x.value,
                        ),
                    ] as const,
            ),
    )
    return checked.filter(([, y]) => y).map(([x]) => x)
}

export async function getAvailableCoins(chainId: ChainId, keyword: string, type: TagType, dataProvider: DataProvider) {
    if (!(await checkAvailabilityOnDataProvider(chainId, keyword, type, dataProvider))) return []
    const ids = coinNamespace.get(dataProvider)?.supportedSymbolIdsMap
    return ids?.get(resolveAlias(chainId, keyword, dataProvider).toLowerCase()) ?? []
}
// #endregion

// #region get trending info
async function getCoinTrending(
    chainId: ChainId,
    id: string,
    currency: Currency,
    dataProvider: DataProvider,
): Promise<Trending> {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            const info = await coinGeckoAPI.getCoinInfo(id)
            const platform_url = `https://www.coingecko.com/en/coins/${info.id}`
            const twitter_url = info.links.twitter_screen_name
                ? `https://twitter.com/${info.links.twitter_screen_name}`
                : ''
            const facebook_url = info.links.facebook_username ? `https://t.me/${info.links.facebook_username}` : ''
            const telegram_url = info.links.telegram_channel_identifier
                ? `https://t.me/${info.links.telegram_channel_identifier}`
                : ''

            return {
                lastUpdated: info.last_updated,
                dataProvider,
                currency,
                coin: {
                    id,
                    name: info.name,
                    symbol: info.symbol.toUpperCase(),
                    is_mirrored: isMirroredKeyword(info.symbol),

                    // TODO: use current language setting
                    description: info.description.en,
                    market_cap_rank: info.market_cap_rank,
                    image_url: info.image.small,
                    tags: info.categories.filter(Boolean),
                    announcement_urls: info.links.announcement_url.filter(Boolean),
                    community_urls: getCommunityLink(
                        [
                            twitter_url,
                            facebook_url,
                            telegram_url,
                            info.links.subreddit_url,
                            ...info.links.chat_url,
                            ...info.links.official_forum_url,
                        ].filter(Boolean),
                    ),
                    source_code_urls: Object.values(info.links.repos_url).flatMap((x) => x),
                    home_urls: info.links.homepage.filter(Boolean),
                    blockchain_urls: uniq(
                        [platform_url, ...info.links.blockchain_site].filter(Boolean).map((url) => url.toLowerCase()),
                    ),
                    platform_url,
                    facebook_url,
                    twitter_url,
                    telegram_url,
                    contract_address:
                        resolveCoinAddress(chainId, id, DataProvider.COIN_GECKO) ??
                        info.platforms[
                            Object.keys(info.platforms).find(
                                (x) => resolveChainId(x, DataProvider.COIN_GECKO) === String(chainId),
                            ) ?? ''
                        ],
                },
                market: (() => {
                    const entries = Object.entries(info.market_data).map(([key, value]) => {
                        if (value && typeof value === 'object') {
                            return [key, value[currency.id] ?? 0]
                        }
                        return [key, value]
                    })
                    return Object.fromEntries(entries)
                })(),
                tickers: info.tickers.slice(0, 30).map((x) => ({
                    logo_url: x.market.logo,
                    trade_url: x.trade_url,
                    market_name: x.market.name,
                    base_name: x.base,
                    target_name: x.target,
                    price: x.converted_last.usd,
                    volume: x.converted_volume.usd,
                    score: x.trust_score,
                    updated: new Date(x.timestamp),
                })),
            }
        case DataProvider.COIN_MARKET_CAP:
            return CoinMarketCap.getCoinTrending(chainId, id, currency)
        case DataProvider.UNISWAP_INFO:
            const { token, marketInfo, tickersInfo } = await uniswapAPI.getCoinInfo(chainId, id)
            return {
                currency,
                dataProvider: DataProvider.UNISWAP_INFO,
                market: marketInfo,
                coin: {
                    id,
                    name: token?.name || '',
                    symbol: token?.symbol || '',
                    decimals: Number(token?.decimals || '0'),
                    is_mirrored: isMirroredKeyword(token?.symbol || ''),
                    blockchain_urls: [`https://info.uniswap.org/token/${id}`, `https://etherscan.io/address/${id}`],
                    image_url: `https://raw.githubusercontent.com/dimensiondev/assets/master/blockchains/ethereum/assets/${id}/logo.png`,
                    platform_url: `https://info.uniswap.org/token/${id}`,
                    contract_address: id,
                },
                tickers: tickersInfo,
                lastUpdated: '',
            }
        default:
            unreachable(dataProvider)
    }
}

export async function getCoinTrendingById(
    chainId: ChainId,
    id: string,
    currency: Currency,
    dataProvider: DataProvider,
) {
    return getCoinTrending(chainId, id, currency, dataProvider)
}

export async function getCoinTrendingByKeyword(
    chainId: ChainId,
    keyword: string,
    tagType: TagType,
    currency: Currency,
    dataProvider: DataProvider,
) {
    // check if the keyword is supported by given data provider
    const coins = await getAvailableCoins(chainId, keyword, tagType, dataProvider)
    if (!coins.length) return null

    // prefer coins on the ethereum network
    const coin = coins.find((x) => x.contract_address) ?? first(coins)
    if (!coin) return null

    return getCoinTrendingById(
        chainId,
        resolveCoinId(chainId, resolveAlias(chainId, keyword, dataProvider), dataProvider) ?? coin.id,
        currency,
        dataProvider,
    )
}
// #endregion

// #region get price stats info
export async function getPriceStats(
    chainId: ChainId,
    id: string,
    currency: Currency,
    days: number,
    dataProvider: DataProvider,
): Promise<Stat[]> {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            return (await coinGeckoAPI.getPriceStats(id, currency.id, days === Days.MAX ? 11430 : days)).prices
        case DataProvider.COIN_MARKET_CAP:
            const interval = (() => {
                if (days === 0) return '1d' // max
                if (days > 365) return '1d' // 1y
                if (days > 90) return '2h' // 3m
                if (days > 30) return '1h' // 1m
                if (days > 7) return '15m' // 1w
                return '5m'
            })()
            const endDate = new Date()
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - days)
            const stats = await CoinMarketCap.getHistorical(
                id,
                currency.name.toUpperCase(),
                days === Days.MAX ? BTC_FIRST_LEGER_DATE : startDate,
                endDate,
                interval,
            )
            if (stats.is_active === 0) return []
            return Object.entries(stats).map(([date, x]) => [date, x[currency.name.toUpperCase()][0]])
        case DataProvider.UNISWAP_INFO:
            const endTime = new Date()
            const startTime = new Date()
            startTime.setDate(endTime.getDate() - days)
            const uniswap_interval = (() => {
                if (days === 0 || days > 365) return 86400 // max
                if (days > 90) return 7200 // 1y
                if (days > 30) return 3600 // 3m
                if (days > 7) return 900 // 1w
                return 300 // 5m
            })()
            return uniswapAPI.getPriceStats(
                chainId,
                id,
                currency,
                uniswap_interval,
                Math.floor((days === Days.MAX ? BTC_FIRST_LEGER_DATE.getTime() : startTime.getTime()) / 1000),
                Math.floor(endTime.getTime() / 1000),
            )
        default:
            return []
    }
}
// #endregion
