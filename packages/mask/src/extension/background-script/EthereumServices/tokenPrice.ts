import type { CurrencyType, CryptoPrice } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'

const URL_BASE = 'https://api.coingecko.com/api/v3'

export async function getTokenPrices(platform: string, contractAddresses: string[], currency: CurrencyType) {
    const requestPath = urlcat(URL_BASE, '/simple/token_price/:platform', {
        platform,
        contract_addresses: contractAddresses.join(','),
        vs_currencies: currency,
    })
    const response = await fetch(requestPath)
    return response.json() as Promise<CryptoPrice>
}

export async function getNativeTokenPrice(tokenIds: string[], currency: CurrencyType) {
    const requestPath = urlcat(URL_BASE, '/simple/price', {
        ids: tokenIds.join(','),
        vs_currencies: currency,
    })
    const response = await fetch(requestPath)
    return response.json() as Promise<CryptoPrice>
}
