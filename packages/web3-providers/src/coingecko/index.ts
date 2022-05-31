import { CurrencyType, Price } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import type { PriceAPI } from '..'

const COINGECKO_URL_BASE = 'https://api.coingecko.com/api/v3'
const COINGECKO_CHAIN_ID_MAPPING: { [key: string]: string } = {
    [ChainId.Mainnet]: 'ethereum',
    [ChainId.BSC]: 'binancecoin',
    [ChainId.xDai]: 'xdai',
    [ChainId.Matic]: 'matic-network',
    [ChainId.Fantom]: 'fantom',
    [ChainId.Conflux]: 'conflux',
    [ChainId.Avalanche]: 'avalanche-2',
    [ChainId.Aurora]: 'aurora-near',
}
export class CoinGeckoAPI implements PriceAPI.Provider {
    /**
     * Get token price
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
