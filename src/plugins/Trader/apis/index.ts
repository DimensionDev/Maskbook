import { Platform, Currency, Coin, Trending } from '../type'
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
                image_url: info.image.small,
            },
            currency,
            platform,
            market: {
                current_price: info.market_data.current_price[currency.id],
                total_volume: info.market_data.total_volume[currency.id],
                price_change_24h: info.market_data.price_change_percentage_24h,
            },
        }
    }
    const info = await coinMarketCapAPI.getCoinInfo(id, currency.name.toUpperCase())
    return {
        coin: {
            id,
            name: info.data.name,
            symbol: info.data.symbol,
            image_url: `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`,
        },
        currency,
        platform,
        market: {
            current_price: info.data.quotes[currency.name.toUpperCase()].price,
            total_volume: info.data.quotes[currency.name.toUpperCase()].volume_24h,
            price_change_24h: info.data.quotes[currency.name.toUpperCase()].percent_change_24h,
        },
    }
}

export async function getCoinTrendingByKeyword(keyword: string, platform: Platform, currency: Currency) {
    const coins = await getCoins(platform)
    const coin = coins.find((x) => x.symbol.toLowerCase() === keyword.toLowerCase())
    if (!coin) return null
    return getCoinInfo(coin.id, platform, currency)
}
