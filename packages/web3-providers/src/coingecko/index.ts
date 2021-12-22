import type { CurrencyType } from '@masknet/plugin-infra'
import { COINGECKO_URL_BASE } from './constants'
import type { PriceAPI } from '..'

export class CoinGeckoAPI implements PriceAPI.Provider {
    async getTokenPrice(tokenId: string, currency: CurrencyType) {
        const requestPath = `${COINGECKO_URL_BASE}/simple/price?ids=${tokenId}&vs_currencies=${currency}`
        const price = await fetch(requestPath).then((r) => r.json() as Promise<PriceAPI.CryptoPrice>)
        return price[tokenId]
    }

    async getTokensPrice(tokenIds: string[], currency: CurrencyType) {
        const requestPath = `${COINGECKO_URL_BASE}/simple/price?ids=${tokenIds}&vs_currencies=${currency}`
        return fetch(requestPath).then((r) => r.json() as Promise<PriceAPI.CryptoPrice>)
    }
}
