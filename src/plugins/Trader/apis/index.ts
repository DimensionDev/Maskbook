import { Platform, Currency, Coin, Trending, Market, Stat } from '../type'
import * as coinGeckoAPI from './coingecko'
import * as coinMarketCapAPI from './coinmarketcap'

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
    const info = await coinMarketCapAPI.getCoinInfo(id, currency.name.toUpperCase())
    return {
        coin: {
            id,
            name: info.data.name,
            symbol: info.data.symbol,
            image_url: `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`,
            market_cap_rank: info.data.rank,
        },
        currency,
        platform,
        market: {
            current_price: info.data.quotes[currency.name.toUpperCase()].price,
            total_volume: info.data.quotes[currency.name.toUpperCase()].volume_24h,
            price_change_percentage_24h: info.data.quotes[currency.name.toUpperCase()].percent_change_24h,
        },
        tickers: [],
    }
}

export async function getCoinTrendingByKeyword(keyword: string, platform: Platform, currency: Currency) {
    const coins = await getCoins(platform)
    const coin = coins.find((x) => x.symbol.toLowerCase() === keyword.toLowerCase())
    if (!coin) return null
    return getCoinInfo(coin.id, platform, currency)
}

export async function getPriceStats(id: string, platform: Platform, currency: Currency, days: number): Promise<Stat[]> {
    return platform === Platform.COIN_GECKO ? (await coinGeckoAPI.getPriceStats(id, currency.id, days)).prices : []
}
