import { DataProvider, Currency, Coin, Trending, Stat, TagType } from '../../types'
import * as coinGeckoAPI from '../coingecko'
import * as coinMarketCapAPI from '../coinmarketcap'
import { Days } from '../../UI/trending/PriceChartDaysControl'
import { getEnumAsArray } from '../../../../utils/enum'
import { BTC_FIRST_LEGER_DATE, CRYPTOCURRENCY_MAP_EXPIRES_AT } from '../../constants'
import { resolveCoinId, resolveCoinAddress, resolveAlias } from './hotfix'
import STOCKS_KEYWORDS from './stocks.json'
import CASHTAG_KEYWORDS from './cashtag.json'
import HASHTAG_KEYWORDS from './hashtag.json'

export async function getCurrenies(dataProvider: DataProvider): Promise<Currency[]> {
    if (dataProvider === DataProvider.COIN_GECKO) {
        const currencies = await coinGeckoAPI.getAllCurrenies()
        return currencies.map((x) => ({
            id: x,
            name: x.toUpperCase(),
        }))
    }
    return Object.values(coinMarketCapAPI.getAllCurrenies()).map((x) => ({
        id: String(x.id),
        name: x.symbol.toUpperCase(),
        symbol: x.token,
        description: x.name,
    }))
}

export async function getLimitedCurrenies(dataProvider: DataProvider): Promise<Currency[]> {
    return Promise.resolve([
        dataProvider === DataProvider.COIN_GECKO
            ? {
                  id: 'usd',
                  name: 'USD',
                  symbol: '$',
                  description: 'Unite State Dollar',
              }
            : {
                  id: '2781',
                  name: 'USD',
                  symbol: '$',
                  description: 'Unite State Dollar',
              },
    ])
}

export async function getCoins(dataProvider: DataProvider): Promise<Coin[]> {
    if (dataProvider === DataProvider.COIN_GECKO) return coinGeckoAPI.getAllCoins()
    return (await coinMarketCapAPI.getAllCoins()).data.map((x) => ({
        id: String(x.id),
        name: x.name,
        symbol: x.symbol,
        eth_address: x.platform?.name === 'Ethereum' ? x.platform.token_address : undefined,
    }))
}

//#region check a specific coin is available on specific dataProvider
const coinNamespace = new Map<
    DataProvider,
    {
        supported: Set<string>
        lastUpdated: Date
    }
>()

async function updateCache(dataProvider: DataProvider) {
    const coins = await getCoins(dataProvider)
    coinNamespace.set(dataProvider, {
        supported: new Set<string>(coins.map((x) => x.symbol.toLowerCase())),
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

export async function checkAvailabilityOnDataProvider(dataProvider: DataProvider, type: TagType, keyword: string) {
    if (isBlockedKeyword(type, keyword)) return false
    const keyword_ = resolveAlias(keyword, dataProvider)
    // cache never built before update in blocking way
    if (!coinNamespace.has(dataProvider)) await updateCache(dataProvider)
    // data fetched before update in nonblocking way
    else if (isCacheExipred(dataProvider)) updateCache(dataProvider)
    return coinNamespace.get(dataProvider)?.supported.has(resolveAlias(keyword_, dataProvider).toLowerCase()) ?? false
}

export async function getAvailableDataProviders(type: TagType, keyword: string) {
    const checked = await Promise.all(
        getEnumAsArray(DataProvider).map(
            async (x) =>
                [
                    x.value,
                    await checkAvailabilityOnDataProvider(x.value, type, resolveAlias(keyword, x.value)),
                ] as const,
        ),
    )
    return checked.filter(([_, y]) => y).map(([x]) => x)
}
//#endregion

export async function getCoinInfo(id: string, dataProvider: DataProvider, currency: Currency): Promise<Trending> {
    if (dataProvider === DataProvider.COIN_GECKO) {
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
    }

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
                if (a.market_reputation !== z.market_reputation) return z.market_reputation - a.market_reputation // reputation from high to low
                if (a.price.toFixed(2) !== z.price.toFixed(2)) return z.price - a.price // price from high to low
                return z.volume - a.volume // volumn from high to low
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
}

export async function getCoinTrendingByKeyword(keyword: string, dataProvider: DataProvider, currency: Currency) {
    const coins = await getCoins(dataProvider)
    const keyword_ = resolveAlias(keyword, dataProvider)
    const coin = coins.find((x) => x.symbol.toLowerCase() === keyword_.toLowerCase())
    if (!coin) return null
    return getCoinInfo(
        resolveCoinId(resolveAlias(keyword_, dataProvider), dataProvider) ?? coin.id,
        dataProvider,
        currency,
    )
}

export async function getPriceStats(
    id: string,
    dataProvider: DataProvider,
    currency: Currency,
    days: number,
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
