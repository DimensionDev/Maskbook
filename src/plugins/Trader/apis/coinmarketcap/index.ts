import CURRENCY_DATA from './currency.json'

// proxy: https://web-api.coinmarketcap.com/v1
const BASE_URL = 'https://coinmarketcap.provide.maskbook.com/v1'

// porxy: https://widgets.coinmarketcap.com/v2
const WIDGET_BASE_URL = 'https://coinmarketcap.provide.maskbook.com/v2'

export interface Status {
    credit_count: number
    elapsed: number
    error_code: number
    error_message: null | string
    notice: null | string
    timestamp: string
}

//#region get all currency
export function getAllCurrenies() {
    return CURRENCY_DATA
}
//#endregion

//#region get all coins
export interface Coin {
    id: number
    name: string
    platform?: {
        id: string
        name: string
        slug: string
        symbol: string
        token_address: string
    }
    rank: number
    slug: string
    status: 'active'
    symbol: string
}

export async function getAllCoins() {
    const response = await fetch(
        `${BASE_URL}/cryptocurrency/map?aux=status,platform&listing_status=active,untracked&sort=cmc_rank`,
    )
    return response.json() as Promise<{
        data: Coin[]
        status: Status
    }>
}
//#endregion

//#regin get coin info
export interface CoinInfo {
    id: number
    name: string
    symbol: string
    website_slug: string
    rank: number
    circulating_supply: number
    total_supply: number
    max_supply: null | number
    quotes: Record<
        string,
        {
            price: number
            volume_24h?: number
            market_cap?: number
            percent_change_1h?: number
            percent_change_24h?: number
            percent_change_7d?: number
        }
    >
    last_updated: number
}

export async function getCoinInfo(id: number, currency: string) {
    const response = await fetch(`${WIDGET_BASE_URL}/ticker/${id}/?ref=widget&convert=${currency}`)
    return response.json() as Promise<CoinInfo>
}
//#endregion
