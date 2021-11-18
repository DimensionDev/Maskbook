import { first, groupBy } from 'lodash-unified'
import type { Coin, Currency, Stat, TagType, Trending } from '../../types'
import { DataProvider } from '@masknet/public-api'
import * as coinGeckoAPI from '../coingecko'
import * as coinMarketCapAPI from '../coinmarketcap'
import * as uniswapAPI from '../uniswap'
import { getEnumAsArray, unreachable } from '@dimensiondev/kit'
import { BTC_FIRST_LEGER_DATE, CRYPTOCURRENCY_MAP_EXPIRES_AT } from '../../constants'
import {
    isBlockedId,
    isBlockedKeyword,
    isMirroredKeyword,
    resolveAlias,
    resolveCoinAddress,
    resolveCoinId,
    resolveNetworkType,
} from './hotfix'
import { getNetworkTypeFromChainId, NetworkType } from '@masknet/web3-shared-evm'
import { currentChainIdSettings, currentNetworkSettings } from '../../../Wallet/settings'
import { Days } from '../../SNSAdaptor/trending/PriceChartDaysControl'

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
            return Object.values(coinMarketCapAPI.getAllCurrencies()).map((x) => ({
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
            const { data: cmcCoins } = await coinMarketCapAPI.getAllCoins()
            return cmcCoins
                .filter((x) => x.status === 'active')
                .map((x) => ({
                    id: String(x.id),
                    name: x.name,
                    symbol: x.symbol,
                    contract_address: x.platform?.name === 'Ethereum' ? x.platform.token_address : undefined,
                }))
        case DataProvider.UNISWAP_INFO:
            // the uniswap has got huge tokens based (more than 2.2k) since we fetch coin info dynamically
            return []
        default:
            unreachable(dataProvider)
    }
}

//#region check a specific coin is available on specific data provider
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

async function updateCache(dataProvider: DataProvider, keyword?: string) {
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
            const coins = (await uniswapAPI.getAllCoinsByKeyword(keyword)).filter(
                (x) => !isBlockedId(x.id, dataProvider),
            )
            if (coins.length) {
                cache.supportedSymbolsSet.add(keyword.toLowerCase())
                cache.supportedSymbolIdsMap.set(keyword.toLowerCase(), coins)
                cache.lastUpdated = new Date()
            }
            return
        }

        // other providers fetch all of supported coins
        const coins = (await getCoins(dataProvider)).filter((x) => !isBlockedId(x.id, dataProvider))
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

export async function checkAvailabilityOnDataProvider(keyword: string, type: TagType, dataProvider: DataProvider) {
    if (isBlockedKeyword(type, keyword)) return false
    // for uniswap we check availability by fetching token info dynamically
    if (dataProvider === DataProvider.UNISWAP_INFO) await updateCache(dataProvider, keyword)
    // cache never built before update in blocking way
    else if (!coinNamespace.has(dataProvider)) await updateCache(dataProvider)
    // data fetched before update in nonblocking way
    else if (isCacheExpired(dataProvider)) updateCache(dataProvider)
    const symbols = coinNamespace.get(dataProvider)?.supportedSymbolsSet
    return symbols?.has(resolveAlias(keyword, dataProvider).toLowerCase()) ?? false
}

export async function getAvailableDataProviders(type?: TagType, keyword?: string) {
    const networkType = getNetworkTypeFromChainId(currentChainIdSettings.value)
    if (!networkType) return []
    if (!type || !keyword)
        return getEnumAsArray(DataProvider)
            .filter((x) => (networkType === NetworkType.Ethereum ? true : x.value !== DataProvider.UNISWAP_INFO))
            .map((y) => y.value)
    const checked = await Promise.all(
        getEnumAsArray(DataProvider)
            .filter((x) => (x.value === DataProvider.UNISWAP_INFO ? networkType === NetworkType.Ethereum : true))
            .map(
                async (x) =>
                    [
                        x.value,
                        await checkAvailabilityOnDataProvider(resolveAlias(keyword, x.value), type, x.value),
                    ] as const,
            ),
    )
    return checked.filter(([, y]) => y).map(([x]) => x)
}

export async function getAvailableCoins(keyword: string, type: TagType, dataProvider: DataProvider) {
    if (!(await checkAvailabilityOnDataProvider(keyword, type, dataProvider))) return []
    const ids = coinNamespace.get(dataProvider)?.supportedSymbolIdsMap
    return ids?.get(resolveAlias(keyword, dataProvider).toLowerCase()) ?? []
}
//#endregion

//#region get trending info
async function getCoinTrending(id: string, currency: Currency, dataProvider: DataProvider): Promise<Trending> {
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

                    // TODO:
                    // use current language setting
                    description: info.description.en,
                    market_cap_rank: info.market_cap_rank,
                    image_url: info.image.small,
                    tags: info.categories.filter(Boolean),
                    announcement_urls: info.links.announcement_url.filter(Boolean),
                    community_urls: [
                        twitter_url,
                        facebook_url,
                        telegram_url,
                        info.links.subreddit_url,
                        ...info.links.chat_url,
                        ...info.links.official_forum_url,
                    ].filter(Boolean),
                    source_code_urls: Object.values(info.links.repos_url).flatMap((x) => x),
                    home_urls: info.links.homepage.filter(Boolean),
                    blockchain_urls: [platform_url, ...info.links.blockchain_site].filter(Boolean),
                    platform_url,
                    facebook_url,
                    twitter_url,
                    telegram_url,
                    contract_address:
                        resolveCoinAddress(id, DataProvider.COIN_GECKO) ??
                        info.platforms[
                            Object.keys(info.platforms).find(
                                (x) => resolveNetworkType(x, DataProvider.COIN_GECKO) === currentNetworkSettings.value,
                            ) ?? ''
                        ],
                },
                market: Object.entries(info.market_data).reduce<any>((accumulated, [key, value]) => {
                    if (value && typeof value === 'object') accumulated[key] = value[currency.id] ?? 0
                    else accumulated[key] = value
                    return accumulated
                }, {}),
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
            const currencyName = currency.name.toUpperCase()
            const [{ data: coinInfo, status }, { data: quotesInfo }, { data: market }] = await Promise.all([
                coinMarketCapAPI.getCoinInfo(id),
                coinMarketCapAPI.getQuotesInfo(id, currencyName),
                coinMarketCapAPI.getLatestMarketPairs(id, currencyName),
            ])
            const trending: Trending = {
                lastUpdated: status.timestamp,
                platform: coinInfo.platform,
                coin: {
                    id,
                    name: coinInfo.name,
                    symbol: coinInfo.symbol,
                    is_mirrored: isMirroredKeyword(coinInfo.symbol),
                    announcement_urls: coinInfo.urls.announcement?.filter(Boolean),
                    tech_docs_urls: coinInfo.urls.technical_doc?.filter(Boolean),
                    message_board_urls: coinInfo.urls.message_board?.filter(Boolean),
                    source_code_urls: coinInfo.urls.source_code?.filter(Boolean),
                    community_urls: [
                        ...(coinInfo.urls.twitter ?? []),
                        ...(coinInfo.urls.reddit ?? []),
                        ...(coinInfo.urls.chat ?? []),
                    ].filter(Boolean),
                    home_urls: coinInfo.urls.website?.filter(Boolean),
                    blockchain_urls: [
                        `https://coinmarketcap.com/currencies/${coinInfo.slug}/`,
                        ...(coinInfo.urls.explorer ?? []),
                    ].filter(Boolean),
                    tags: coinInfo.tags ?? void 0,
                    image_url: `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`,
                    platform_url: `https://coinmarketcap.com/currencies/${coinInfo.slug}/`,
                    twitter_url: coinInfo.urls.twitter?.find((x) => x.includes('twitter')),
                    telegram_url: coinInfo.urls.chat?.find((x) => x.includes('telegram')),
                    market_cap_rank: quotesInfo?.[id]?.cmc_rank,
                    description: coinInfo.description,
                    contract_address:
                        resolveCoinAddress(id, DataProvider.COIN_MARKET_CAP) ??
                        coinInfo.contract_address.find(
                            (x) =>
                                resolveNetworkType(x.platform.coin.id, DataProvider.COIN_MARKET_CAP) ===
                                currentNetworkSettings.value,
                        )?.contract_address,
                },
                currency,
                dataProvider,
                tickers: market.market_pairs
                    .map((pair) => ({
                        logo_url: `https://s2.coinmarketcap.com/static/img/exchanges/32x32/${pair.exchange.id}.png`,
                        trade_url: pair.market_url,
                        market_name: pair.exchange.name,
                        market_reputation: pair.market_reputation,
                        base_name: pair.market_pair_base.exchange_symbol,
                        target_name: pair.market_pair_quote.exchange_symbol,
                        price:
                            pair.market_pair_base.currency_id === market.id
                                ? pair.quote[currencyName].price
                                : pair.quote[currencyName].price_quote,
                        volume: pair.quote[currencyName].volume_24h,
                        score: String(pair.market_score),
                        updated: new Date(pair.quote[currencyName].last_updated),
                    }))
                    .sort((a, z) => {
                        if (a.market_reputation !== z.market_reputation)
                            return z.market_reputation - a.market_reputation // reputation from high to low
                        if (a.price.toFixed(2) !== z.price.toFixed(2)) return z.price - a.price // price from high to low
                        return z.volume - a.volume // volume from high to low
                    }),
            }
            const quotesInfo_ = quotesInfo?.[id]
            if (quotesInfo_)
                trending.market = {
                    circulating_supply: quotesInfo_.total_supply ?? void 0,
                    total_supply: quotesInfo_.total_supply ?? void 0,
                    max_supply: quotesInfo_.max_supply ?? void 0,
                    market_cap: quotesInfo_.quote[currencyName].market_cap,
                    current_price: quotesInfo_.quote[currencyName].price,
                    total_volume: quotesInfo_.quote[currencyName].volume_24h,
                    price_change_percentage_1h: quotesInfo_.quote[currencyName].percent_change_1h,
                    price_change_percentage_24h: quotesInfo_.quote[currencyName].percent_change_24h,
                    price_change_percentage_1h_in_currency: quotesInfo_.quote[currencyName].percent_change_1h,
                    price_change_percentage_24h_in_currency: quotesInfo_.quote[currencyName].percent_change_24h,
                    price_change_percentage_7d_in_currency: quotesInfo_.quote[currencyName].percent_change_7d,
                }
            return trending
        case DataProvider.UNISWAP_INFO:
            const { token, marketInfo, tickersInfo } = await uniswapAPI.getCoinInfo(id)
            return {
                currency,
                dataProvider: DataProvider.UNISWAP_INFO,
                market: marketInfo,
                coin: {
                    id,
                    name: token?.name,
                    symbol: token?.symbol,
                    decimals: Number(token?.decimals),
                    is_mirrored: isMirroredKeyword(token?.symbol ?? ''),
                    blockchain_urls: [`https://info.uniswap.org/token/${id}`, `https://etherscan.io/address/${id}`],
                    image_url: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${id}/logo.png`,
                    platform_url: `https://info.uniswap.org/token/${id}`,
                    contract_address: id,
                },
                tickers: tickersInfo,
                lastUpdated: '',
            } as Trending
        default:
            unreachable(dataProvider)
    }
}

export async function getCoinTrendingById(id: string, currency: Currency, dataProvider: DataProvider) {
    return getCoinTrending(id, currency, dataProvider)
}

export async function getCoinTrendingByKeyword(
    keyword: string,
    tagType: TagType,
    currency: Currency,
    dataProvider: DataProvider,
) {
    // check if the keyword is supported by given data provider
    const coins = await getAvailableCoins(keyword, tagType, dataProvider)
    if (!coins.length) return null

    // prefer coins on the ethereum network
    const coin = coins.find((x) => x.contract_address) ?? first(coins)
    if (!coin) return null

    return getCoinTrendingById(
        resolveCoinId(resolveAlias(keyword, dataProvider), dataProvider) ?? coin.id,
        currency,
        dataProvider,
    )
}
//#endregion

//#region get price stats info
export async function getPriceStats(
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
            const stats = await coinMarketCapAPI.getHistorical(
                id,
                currency.name.toUpperCase(),
                days === Days.MAX ? BTC_FIRST_LEGER_DATE : startDate,
                endDate,
                interval,
            )
            if (stats.data.is_active === 0) return []
            return Object.entries(stats.data).map(([date, x]) => [date, x[currency.name.toUpperCase()][0]])
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
//#endregion
