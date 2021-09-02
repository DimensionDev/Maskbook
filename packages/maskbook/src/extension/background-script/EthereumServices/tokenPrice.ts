import type { CurrencyType, CryptoPrice } from '@masknet/web3-shared'

const URL_BASE = 'https://api.coingecko.com/api/v3'

export async function getTokenPrices(platform: string, contractAddresses: string[], currency: CurrencyType) {
    const addressList = contractAddresses.join(',')
    const requestPath = `${URL_BASE}/simple/token_price/${platform}?contract_addresses=${addressList}&vs_currencies=${currency}`

    const prices = await fetch(requestPath).then((r) => r.json() as Promise<CryptoPrice>)
    return prices
}

export async function getNativeTokenPrice(tokenIds: string[], currency: CurrencyType) {
    const requestPath = `${URL_BASE}/simple/price?ids=${tokenIds.join(',')}&vs_currencies=${currency}`
    const prices = await fetch(requestPath).then((r) => r.json() as Promise<CryptoPrice>)
    return prices
}
