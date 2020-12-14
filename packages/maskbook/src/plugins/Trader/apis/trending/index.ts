import { first, groupBy } from 'lodash-es'
import { DataProvider, Currency, Coin, Trending, Stat, TagType } from '../../types'
import * as coinGeckoAPI from '../coingecko'
import * as coinMarketCapAPI from '../coinmarketcap'
import * as uniswapAPI from '../uniswap'
import { Days } from '../../UI/trending/PriceChartDaysControl'
import { getEnumAsArray } from '../../../../utils/enum'
import { BTC_FIRST_LEGER_DATE, CRYPTOCURRENCY_MAP_EXPIRES_AT } from '../../constants'
import { resolveCoinId, resolveCoinAddress, resolveAlias } from './hotfix'
import STOCKS_KEYWORDS from './stocks.json'
import CASHTAG_KEYWORDS from './cashtag.json'
import HASHTAG_KEYWORDS from './hashtag.json'
import { unreachable } from '../../../../utils/utils'

export async function getCurrenies(dataProvider: DataProvider): Promise<Currency[]> {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            const currencies = await coinGeckoAPI.getAllCurrenies()
            return currencies.map((x) => ({
                id: x,
                name: x.toUpperCase(),
            }))
        case DataProvider.COIN_MARKET_CAP:
            return Object.values(coinMarketCapAPI.getAllCurrenies()).map((x) => ({
                id: String(x.id),
                name: x.symbol.toUpperCase(),
                symbol: x.token,
                description: x.name,
            }))
        case DataProvider.UNISWAP:
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

export async function getLimitedCurrenies(dataProvider: DataProvider): Promise<Currency[]> {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            return [
                {
                    id: 'usd',
                    name: 'USD',
                    symbol: '$',
                    description: 'Unite State Dollar',
                },
            ]
        case DataProvider.COIN_MARKET_CAP:
            return [
                {
                    id: '2781',
                    name: 'USD',
                    symbol: '$',
                    description: 'Unite State Dollar',
                },
            ]
        case DataProvider.UNISWAP:
            return [
                {
                    id: 'usd',
                    name: 'USD',
                    symbol: '$',
                    description: 'Unite State Dollar',
                },
            ]
    }
}

export async function getCoins(dataProvider: DataProvider): Promise<Coin[]> {
    if (dataProvider === DataProvider.COIN_GECKO) return coinGeckoAPI.getAllCoins()
    if (dataProvider === DataProvider.UNISWAP) return uniswapAPI.getAllCoins()

    // for cmc we should filter inactive coins out
    const { data: coins } = await coinMarketCapAPI.getAllCoins()
    return coins
        .filter((x) => x.status === 'active')
        .map((y) => ({
            id: String(y.id),
            name: y.name,
            symbol: y.symbol,
            eth_address: y.platform?.name === 'Ethereum' ? y.platform.token_address : undefined,
        }))
}

//#region check a specific coin is available on specific dataProvider
const coinNamespace = new Map<
    DataProvider,
    {
        supportedSymbolsSet: Set<string>
        supportedSymbolIdsMap: Map<string, Coin[]>
        lastUpdated: Date
    }
>()

async function updateCache(dataProvider: DataProvider) {
    const coins = await getCoins(dataProvider)
    const coinsGrouped = groupBy(coins, (x) => x.symbol.toLowerCase())
    coinNamespace.set(dataProvider, {
        supportedSymbolsSet: new Set<string>(Object.keys(coinsGrouped)),
        supportedSymbolIdsMap: new Map(Object.entries(coinsGrouped).map(([symbol, coins]) => [symbol, coins])),
        lastUpdated: new Date(),
    })
}

function isCacheExipred(dataProvider: DataProvider) {
    return (
        coinNamespace.has(dataProvider) &&
        new Date().getTime() - (coinNamespace.get(dataProvider)?.lastUpdated.getTime() ?? 0) >
            CRYPTOCURRENCY_MAP_EXPIRES_AT
    )
}

function isBlockedKeyword(type: TagType, keyword: string) {
    if (type === TagType.HASH) return [...STOCKS_KEYWORDS, ...HASHTAG_KEYWORDS].includes(keyword.toUpperCase())
    else if (type === TagType.CASH) return [...STOCKS_KEYWORDS, ...CASHTAG_KEYWORDS].includes(keyword.toUpperCase())
    return true
}

export async function checkAvailabilityOnDataProvider(keyword: string, type: TagType, dataProvider: DataProvider) {
    if (isBlockedKeyword(type, keyword)) return false
    const keyword_ = resolveAlias(keyword, dataProvider)
    // cache never built before update in blocking way
    if (!coinNamespace.has(dataProvider)) await updateCache(dataProvider)
    // data fetched before update in nonblocking way
    else if (isCacheExipred(dataProvider)) updateCache(dataProvider)
    return coinNamespace.get(dataProvider)?.supportedSymbolsSet.has(keyword_.toLowerCase()) ?? false
}

export async function getAvailableDataProviders(type: TagType, keyword: string) {
    const checked = await Promise.all(
        getEnumAsArray(DataProvider).map(
            async (x) =>
                [
                    x.value,
                    await checkAvailabilityOnDataProvider(resolveAlias(keyword, x.value), type, x.value),
                ] as const,
        ),
    )
    return checked.filter(([_, y]) => y).map(([x]) => x)
}

export async function getAvailableCoins(keyword: string, type: TagType, dataProvider: DataProvider) {
    if (isBlockedKeyword(type, keyword)) return []
    const keyword_ = resolveAlias(keyword, dataProvider)
    // cache never built before update in blocking way
    if (!coinNamespace.has(dataProvider)) await updateCache(dataProvider)
    // data fetched before update in nonblocking way
    else if (isCacheExipred(dataProvider)) updateCache(dataProvider)
    return coinNamespace.get(dataProvider)?.supportedSymbolIdsMap.get(keyword_.toLowerCase()) ?? []
}

//#endregion

export async function getCoinInfo(id: string, currency: Currency, dataProvider: DataProvider): Promise<Trending> {
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
                    eth_address:
                        resolveCoinAddress(id, DataProvider.COIN_GECKO) ??
                        (info.asset_platform_id === 'ethereum' ? info.contract_address : undefined),
                },
                market: Object.entries(info.market_data).reduce((accumulated, [key, value]) => {
                    if (value && typeof value === 'object') accumulated[key] = value[currency.id]
                    else accumulated[key] = value
                    return accumulated
                }, {} as any),
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
                coin: {
                    id,
                    name: coinInfo.name,
                    symbol: coinInfo.symbol,
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
                    eth_address:
                        resolveCoinAddress(id, DataProvider.COIN_MARKET_CAP) ??
                        (coinInfo.platform?.name === 'Ethereum' ? coinInfo.platform?.token_address : undefined),
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
        case DataProvider.UNISWAP:
            const coin = uniswapAPI.getAllCoins().find((x) => x.id === id)
            if (!coin) throw new Error(`Cannot find coin with id ${id}`)
            return {
                currency,
                dataProvider: DataProvider.UNISWAP,
                market: {
                    current_price: await uniswapAPI.getMidPriceOnDAI(coin),
                },
                coin,
                tickers: [],
                lastUpdated: '',
            } as Trending
        default:
            unreachable(dataProvider)
    }
}

export async function getCoinTrendingByKeyword(
    keyword: string,
    tagType: TagType,
    currency: Currency,
    dataProvider: DataProvider,
) {
    const keyword_ = resolveAlias(keyword, dataProvider)
    const coins = await getAvailableCoins(keyword_, tagType, dataProvider)
    if (!coins.length) return null
    // prefer coins on the etherenum network
    const coin = coins.find((x) => x.eth_address) ?? first(coins)
    if (!coin) return null
    return getCoinTrendingById(resolveCoinId(keyword_, dataProvider) ?? coin.id, currency, dataProvider)
}

export async function getCoinTrendingById(id: string, currency: Currency, dataProvider: DataProvider) {
    return getCoinInfo(id, currency, dataProvider)
}

export async function getPriceStats(
    id: string,
    currency: Currency,
    days: number,
    dataProvider: DataProvider,
): Promise<Stat[]> {
    if (dataProvider === DataProvider.COIN_GECKO) {
        const stats = await coinGeckoAPI.getPriceStats(id, currency.id, days === Days.MAX ? 11430 : days)
        return stats.prices
    }
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
}
