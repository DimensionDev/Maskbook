import { CurrencyType, Price } from '@masknet/web3-shared-base'
import type { PriceAPI } from '..'
import urlcat from 'urlcat'

const COINGECKO_URL_BASE = 'https://api.coingecko.com/api/v3'
const COINGECKO_CHAIN_ID_MAPPING: { [key: string]: string } = {
    1: 'ethereum',
    56: 'binancecoin',
    100: 'xdai',
    137: 'matic-network',
    250: 'fantom',
    1030: 'conflux',
    43114: 'avalanche-2',
    1313161554: 'aurora-near',
}
export class CoinGeckoAPI implements PriceAPI.Provider {
    /**
     * Takes get token price
     * @returns sum of a and b
     * @param id string *refers to coins/list
     * @param currencyType
     * @param chainId
     * @param nativeToken
     */
    async getTokenPrice(id: string, currencyType = CurrencyType.USD, chainId?: number, nativeToken?: boolean) {
        if (chainId && nativeToken) {
            return this.getNativeTokenPrices(chainId, currencyType)
        }
        const requestPath = urlcat(`${COINGECKO_URL_BASE}/simple/price`, { ids: id, ['vs_currencies']: currencyType })
        const price = await fetch(requestPath).then(
            (r) => r.json() as Promise<Record<string, Record<CurrencyType, number>>>,
        )
        return price[id][currencyType]
    }

    async getTokenPrices(platform: string, contractAddresses: string[], currency = CurrencyType.USD) {
        const addressList = contractAddresses.join(',')
        const requestPath = `${COINGECKO_URL_BASE}/simple/token_price/${platform}?contract_addresses=${addressList}&vs_currencies=${currency}`
        return fetch(requestPath).then((r) => r.json() as Promise<Record<string, Price>>)
    }

    async getNativeTokenPrices(chainId: number, currency = CurrencyType.USD) {
        const id = COINGECKO_CHAIN_ID_MAPPING[chainId]
        const requestPath = urlcat(`${COINGECKO_URL_BASE}/simple/price`, { ids: id, ['vs_currencies']: currency })
        const price = await fetch(requestPath).then(
            (r) => r.json() as Promise<Record<string, Record<CurrencyType, number>>>,
        )
        return price[id][currency]
    }

    async getTokensPrice(listOfAddress: string[], currencyType = CurrencyType.USD) {
        const requestPath = `${COINGECKO_URL_BASE}/simple/price?ids=${listOfAddress}&vs_currencies=${currencyType}`
        const response = await fetch(requestPath).then(
            (r) => r.json() as Promise<Record<string, Record<CurrencyType, number>>>,
        )

        return Object.fromEntries(Object.keys(response).map((address) => [address, response[address][currencyType]]))
    }
}
