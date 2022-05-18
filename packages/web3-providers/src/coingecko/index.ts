import { CurrencyType, Price } from '@masknet/web3-shared-base'
import type { PriceAPI } from '..'

const COINGECKO_URL_BASE = 'https://api.coingecko.com/api/v3'

export class CoinGeckoAPI implements PriceAPI.Provider {
    async getTokenPrices(platform: string, contractAddresses: string[], currency = CurrencyType.USD) {
        const addressList = contractAddresses.join(',')
        const requestPath = `${COINGECKO_URL_BASE}/simple/token_price/${platform}?contract_addresses=${addressList}&vs_currencies=${currency}`
        return fetch(requestPath).then((r) => r.json() as Promise<Record<string, Price>>)
    }

    async getNativeTokenPrices(tokenIds: string[], currency = CurrencyType.USD) {
        const requestPath = `${COINGECKO_URL_BASE}/simple/price?ids=${tokenIds.join(',')}&vs_currencies=${currency}`
        return fetch(requestPath).then((r) => r.json() as Promise<Record<string, Price>>)
    }

    async getTokenPrice(id: string, currencyType = CurrencyType.USD) {
        const requestPath = `${COINGECKO_URL_BASE}/simple/price?ids=${id}&vs_currencies=${currencyType}`
        const price = await fetch(requestPath).then(
            (r) => r.json() as Promise<Record<string, Record<CurrencyType, number>>>,
        )
        return price[id][currencyType]
    }

    async getTokensPrice(listOfAddress: string[], currencyType = CurrencyType.USD) {
        const requestPath = `${COINGECKO_URL_BASE}/simple/price?ids=${listOfAddress}&vs_currencies=${currencyType}`
        const response = await fetch(requestPath).then(
            (r) => r.json() as Promise<Record<string, Record<CurrencyType, number>>>,
        )
        return Object.keys(response).reduce<Record<string, number>>((accumulate, address) => {
            accumulate[address] = response[address][currencyType]
            return accumulate
        }, {})
    }
}
