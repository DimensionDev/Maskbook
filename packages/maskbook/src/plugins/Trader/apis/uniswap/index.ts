import type { Coin } from '../../types'

/**
 * For uniswap all coins should be treated as available
 * Please use getCoinInfo directly
 */
export function getAllCoins() {
    throw new Error('For uniswap all coins are available by default.')
}

export async function getAllCoinsByKeyword(keyword: string) {
    return [] as Coin[]
}

export async function getCoinInfo(id: string) {
    return {} as Coin
}

export async function getPriceStats(id: string, coinId: string) {
    return []
}
