import { DataProvider, Currency, Coin, Trending, Stat } from '../types'
import * as coinGeckoAPI from './coingecko'
import * as coinMarketCapAPI from './coinmarketcap'
import { Days } from '../UI/PriceChartDaysControl'
import { getEnumAsArray } from '../../../utils/enum'
import { BTC_FIRST_LEGER_DATE, CRYPTOCURRENCY_MAP_EXPIRES_AT } from '../constants'

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
    }))
}

//#region check a specific coin is available on specific dataProvider
const availabilityCache = new Map<
    DataProvider,
    {
        supported: Set<string>
        lastUpdated: Date
    }
>()

export async function checkAvailabilityOnDataProvider(dataProvider: DataProvider, keyword: string) {
    if (
        // cache never built before
        !availabilityCache.has(dataProvider) ||
        // cache expired
        new Date().getTime() - (availabilityCache.get(dataProvider)?.lastUpdated.getTime() ?? 0) >
            CRYPTOCURRENCY_MAP_EXPIRES_AT
    ) {
        const coins = await getCoins(dataProvider)
        availabilityCache.set(dataProvider, {
            supported: new Set<string>(coins.map((x) => x.symbol.toLowerCase())),
            lastUpdated: new Date(),
        })
    }
    return availabilityCache.get(dataProvider)?.supported.has(keyword.toLowerCase()) ?? false
}

export async function getAvailableDataProviders(keyword: string) {
    const checked = await Promise.all(
        getEnumAsArray(DataProvider).map(
            async (x) => [x.value, await checkAvailabilityOnDataProvider(x.value, keyword)] as const,
        ),
    )
    return checked.filter(([_, y]) => y).map(([x]) => x)
}
//#endregion

export async function getCoinInfo(id: string, dataProvider: DataProvider, currency: Currency): Promise<Trending> {
    if (dataProvider === DataProvider.COIN_GECKO) {
        const info = await coinGeckoAPI.getCoinInfo(id)
        return {
            coin: {
                id,
                name: info.name,
                symbol: info.symbol,

                // TODO:
                // use current language setting
                description: info.description.en,
                market_cap_rank: info.market_cap_rank,
                image_url: info.image.small,
                home_url: info.links.homepage.filter(Boolean)[0],
            },
            currency,
            dataProvider,
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
            })),
        }
    }

    const currencyName = currency.name.toUpperCase()
    const { data: info } = await coinMarketCapAPI.getCoinInfo(id, currencyName)
    const { data: market } = await coinMarketCapAPI.getLatestMarketPairs(id, currencyName)

    return {
        coin: {
            id,
            name: info.name,
            symbol: info.symbol,
            image_url: `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`,
            market_cap_rank: info.rank,
        },
        currency,
        dataProvider,
        market: {
            current_price: info.quotes[currencyName].price,
            total_volume: info.quotes[currencyName].volume_24h,
            price_change_percentage_1h_in_currency: info.quotes[currencyName].percent_change_1h,
            price_change_percentage_24h_in_currency: info.quotes[currencyName].percent_change_24h,
            price_change_percentage_7d_in_currency: info.quotes[currencyName].percent_change_7d,
        },
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
            }))
            .sort((a, z) => {
                if (a.market_reputation !== z.market_reputation) return z.market_reputation - a.market_reputation // reputation from high to low
                if (a.price.toFixed(2) !== z.price.toFixed(2)) return z.price - a.price // price from high to low
                return z.volume - a.volume // volumn from high to low
            }),
    }
}

//#region hotfix
// FIXME:
// this is hotfix for duplicate token name
// we should support multiple-coins switing in the future
const CMC_KEYWORKD_ID_MAP: {
    [key: string]: string
} = {
    UNI: '7083',
}
function resolveCoinId(keyword: string, dataProvider: DataProvider) {
    if (dataProvider === DataProvider.COIN_MARKET_CAP) return CMC_KEYWORKD_ID_MAP[keyword.toUpperCase()]
    return undefined
}
//#endregion

export async function getCoinTrendingByKeyword(keyword: string, dataProvider: DataProvider, currency: Currency) {
    const coins = await getCoins(dataProvider)
    const coin = coins.find((x) => x.symbol.toLowerCase() === keyword.toLowerCase())
    if (!coin) return null
    return getCoinInfo(resolveCoinId(keyword, dataProvider) ?? coin.id, dataProvider, currency)
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
    return Object.entries(stats.data).map(([date, x]) => [date, x[currency.name.toUpperCase()][0]])
}
