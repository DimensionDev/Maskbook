import type { CurrencyType } from '@masknet/plugin-infra/web3'
import type { TokenPriceBaseAPI } from '../types'

const URL_BASE = 'https://api.coingecko.com/api/v3'

export class TokenPriceAPI implements TokenPriceBaseAPI.Provider {
    async getTokenPrices(platform: string, contractAddresses: string[], currency: CurrencyType) {
        const addressList = contractAddresses.join(',')
        const requestPath = `${URL_BASE}/simple/token_price/${platform}?contract_addresses=${addressList}&vs_currencies=${currency}`
        const response = await fetch(requestPath)
        const prices: TokenPriceBaseAPI.CryptoPrice = await response.json()
        return prices
    }
    async getNativeTokenPrice(tokenIds: string[], currency: CurrencyType) {
        const requestPath = `${URL_BASE}/simple/price?ids=${tokenIds.join(',')}&vs_currencies=${currency}`
        const response = await fetch(requestPath)
        const prices: TokenPriceBaseAPI.CryptoPrice = await response.json()
        return prices
    }
}
