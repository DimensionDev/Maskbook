import type { CurrencyType } from '@masknet/plugin-infra/web3'
import { COINGECKO_URL_BASE } from './constants'
import type { PriceAPI } from '../types'

export class CoinGeckoAPI implements PriceAPI.Provider {
    async getTokenPrice(tokenId: string, currency: CurrencyType) {
        const requestPath = `${COINGECKO_URL_BASE}/simple/price?ids=${tokenId}&vs_currencies=${currency}`
        const response = await fetch(requestPath)
        const price: PriceAPI.CryptoPrice = await response.json()
        return price[tokenId]
    }

    async getTokensPrice(tokenIds: string[], currency: CurrencyType) {
        const requestPath = `${COINGECKO_URL_BASE}/simple/price?ids=${tokenIds}&vs_currencies=${currency}`
        const response = await fetch(requestPath)
        const price: PriceAPI.CryptoPrice = await response.json()
        return price
    }
}
