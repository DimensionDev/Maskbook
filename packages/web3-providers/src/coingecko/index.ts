import type { CurrencyType } from '@masknet/plugin-infra'
import { COINGECKO_URL_BASE } from './constants'

export interface CryptoPrice {
    [token: string]: {
        [key in CurrencyType]?: string
    }
}

export async function getTokenPrice(tokenId: string, currency: CurrencyType) {
    const requestPath = `${COINGECKO_URL_BASE}/simple/price?ids=${tokenId}&vs_currencies=${currency}`
    const price = await fetch(requestPath).then((r) => r.json() as Promise<CryptoPrice>)
    return price[tokenId]
}

export async function getTokensPrice(tokenIds: string[], currency: CurrencyType) {
    const requestPath = `${COINGECKO_URL_BASE}/simple/price?ids=${tokenIds}&vs_currencies=${currency}`
    return fetch(requestPath).then((r) => r.json() as Promise<CryptoPrice>)
}
