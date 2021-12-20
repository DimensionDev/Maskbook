import type { CurrencyType } from '@masknet/plugin-infra'
import urlcat from 'urlcat'
import { COINGECKO_URL_BASE } from './constants'

export interface CryptoPrice {
    [token: string]: {
        [key in CurrencyType]?: string
    }
}

export async function getTokenPrice(tokenId: string, currency: CurrencyType) {
    const prices = await getTokensPrice([tokenId], currency)
    return prices[tokenId]
}

export async function getTokensPrice(tokenIds: string[], currency: CurrencyType) {
    const requestPath = urlcat(COINGECKO_URL_BASE, '/simple/price', {
        ids: tokenIds.join(','),
        vs_currencies: currency,
    })
    const response = await fetch(requestPath)
    return response.json() as Promise<CryptoPrice>
}
