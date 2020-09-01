import { Platform, Currency, Coin, Trending, Stat } from '../types'
import * as coinGeckoAPI from './coingecko'
import * as coinMarketCapAPI from './coinmarketcap'
import { Days } from '../UI/PriceChartDaysControl'
import { getEnumAsArray } from '../../../utils/enum'

export async function getCurrenies(platform: Platform): Promise<Currency[]> {
    if (platform === Platform.COIN_GECKO) {
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

export async function getLimitedCurrenies(platform: Platform): Promise<Currency[]> {
    const usd =
        platform === Platform.COIN_GECKO
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
              }
    return Promise.resolve([usd])
}

export async function getCoins(platform: Platform): Promise<Coin[]> {
    if (platform === Platform.COIN_GECKO) return coinGeckoAPI.getAllCoins()
    return (await coinMarketCapAPI.getAllCoins()).data.map((x) => ({
        id: String(x.id),
        name: x.name,
        symbol: x.symbol,
    }))
}

//#region check a specific coin is available on specific platform
const availabilityCache = new Map<
    Platform,
    {
        supported: Set<string>
        lastUpdated: Date
    }
>()

export async function checkAvailabilityAtPlatform(platform: Platform, keyword: string) {
    if (
        // cache never built before
        !availabilityCache.has(platform) ||
        // cache expired in 24h
        new Date().getTime() - (availabilityCache.get(platform)?.lastUpdated.getTime() ?? 0) >
            24 /* hours */ * 60 /* minutes */ * 60 /* seconds */ * 1000 /* milliseconds */
    ) {
        const coins = await getCoins(platform)
        availabilityCache.set(platform, {
            supported: new Set<string>(coins.map((x) => x.symbol.toLowerCase())),
            lastUpdated: new Date(),
        })
    }
    return availabilityCache.get(platform)?.supported.has(keyword.toLowerCase()) ?? false
}

export async function checkAvailability(keyword: string) {
    return (await Promise.all(getEnumAsArray(Platform).map((x) => checkAvailabilityAtPlatform(x.value, keyword)))).some(
        Boolean,
    )
}
//#endregion

export async function getCoinInfo(id: string, platform: Platform, currency: Currency): Promise<Trending> {
    if (platform === Platform.COIN_GECKO) {
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
            platform,
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
                volumn: x.converted_volume.usd,
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
        platform,
        market: {
            current_price: info.quotes[currencyName].price,
            total_volume: info.quotes[currencyName].volume_24h,
            price_change_percentage_1h_in_currency: info.quotes[currencyName].percent_change_1h,
            price_change_percentage_24h_in_currency: info.quotes[currencyName].percent_change_24h,
            price_change_percentage_7d_in_currency: info.quotes[currencyName].percent_change_7d,
        },
        tickers: market.market_pairs.map((pair) => ({
            logo_url: '',
            trade_url: pair.market_url,
            market_name: pair.exchange.name,
            base_name: pair.market_pair_base.exchange_symbol,
            target_name: pair.market_pair_quote.exchange_symbol,
            price:
                pair.market_pair_base.currency_id === market.id
                    ? pair.quote[currencyName].price
                    : pair.quote[currencyName].price_quote,
            volumn: pair.quote[currencyName].volume_24h,
            score: String(pair.market_score),
        })),
    }
}

export async function getCoinTrendingByKeyword(keyword: string, platform: Platform, currency: Currency) {
    const coins = await getCoins(platform)
    const coin = coins.find((x) => x.symbol.toLowerCase() === keyword.toLowerCase())
    if (!coin) return null
    return getCoinInfo(coin.id, platform, currency)
}

export async function getPriceStats(id: string, platform: Platform, currency: Currency, days: number): Promise<Stat[]> {
    if (platform === Platform.COIN_GECKO) {
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
        // the bitcoin ledger started at 03 Jan 2009
        days === Days.MAX ? new Date(1230940800000) : startDate,
        endDate,
        interval,
    )
    return Object.entries(stats.data).map(([date, x]) => [date, x[currency.name.toUpperCase()][0]])
}
