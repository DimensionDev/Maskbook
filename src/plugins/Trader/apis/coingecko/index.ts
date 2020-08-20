const BASE_URL = 'https://coingecko.com/api/documentations/v3'

//#region get currency
export async function getAllCurrenies() {
    const response = await fetch(`${BASE_URL}/simple/supported_vs_currencies`)
    return response.json() as Promise<string[]>
}
//#endregion

//#region get coins list
export interface Coin {
    id: string
    name: string
    symbol: string
}

export async function getAllCoins() {
    const response = await fetch(`${BASE_URL}/coins/list`)
    return response.json() as Promise<Coin[]>
}
//#endregion

//#region get coin info
export interface CoinInfo {
    asset_platform_id: string
    block_time_in_minutes: number
    categories: string[]
    contract_address: string
    description: Record<string, string>
    developer_score: number
    id: string
    image: {
        large: string
        small: string
        thumb: string
    }
    last_updated: string
    links: {
        announcement_url: string[]
        bitcointalk_thread_identifier: null
        blockchain_site: string[]
        chat_url: string[]
        facebook_username: string
        homepage: string[]
        official_forum_url: string[]
        repos_url: { github: string[]; bitbucket: string[] }
        subreddit_url: string
        telegram_channel_identifier: string
        twitter_screen_name: string
    }
    liquidity_score: string
    localization: Record<string, string>
    market_cap_rank: number
    market_data: {
        high_24h: Record<string, number>
        low_24h: Record<string, number>
        market_cap: Record<string, number>
        market_cap_rank: number
        price_change_24h: number
        total_supply: number
        total_volume: Record<string, number>
    }
    name: string
    symbol: string
}

export async function getCoinInfo(id: string) {
    const response = await fetch(`${BASE_URL}/coins/${id}?developer_data=false&community_data=false&tickers=false`)
    return response.json() as Promise<CoinInfo>
}
//#endregion
