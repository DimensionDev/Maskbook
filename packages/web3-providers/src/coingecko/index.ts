import { CurrencyType, Price } from '@masknet/web3-shared-base'
import urlcat from 'urlcat'
import type { PriceAPI } from '..'

const COINGECKO_URL_BASE = 'https://api.coingecko.com/api/v3'

export class CoinGeckoAPI implements PriceAPI.Provider {
    async getTokenPrice(platform_id: string, address: string, currencyType = CurrencyType.USD) {
        const price = await this.getTokenPrices(platform_id, [address], currencyType)

        return Number(price[address][currencyType]) ?? 0
    }

    async getTokenPrices(platform_id: string, contractAddresses: string[], currency = CurrencyType.USD) {
        const addressList = contractAddresses.join(',')
        const requestPath = urlcat(COINGECKO_URL_BASE, '/simple/token_price/:platform_id', {
            platform_id,
            ['contract_addresses']: addressList,
            ['vs_currencies']: currency,
        })
        return fetch(requestPath).then((r) => r.json() as Promise<Record<string, Price>>)
    }

    async getTokenPriceByCoinId(coin_id: string, currency = CurrencyType.USD) {
        const requestPath = urlcat(`${COINGECKO_URL_BASE}/simple/price`, { ids: coin_id, ['vs_currencies']: currency })
        const price = await fetch(requestPath).then(
            (r) => r.json() as Promise<Record<string, Record<CurrencyType, number>>>,
        )
        return price[coin_id][currency]
    }

    async getTokensPrice(listOfAddress: string[], currencyType = CurrencyType.USD) {
        const requestPath = `${COINGECKO_URL_BASE}/simple/price?ids=${listOfAddress}&vs_currencies=${currencyType}`
        const response = await fetch(requestPath).then(
            (r) => r.json() as Promise<Record<string, Record<CurrencyType, number>>>,
        )

        return Object.fromEntries(Object.keys(response).map((address) => [address, response[address][currencyType]]))
    }
}
