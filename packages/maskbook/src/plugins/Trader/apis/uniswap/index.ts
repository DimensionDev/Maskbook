import type { Coin, Currency } from '../../types'
import { fetchTokensByKeyword } from '../uniswap-v2-subgraph'

/**
 * For uniswap all coins should be treated as available
 * Please use getCoinInfo directly
 */
export function getAllCoins() {
    throw new Error('For uniswap all coins are available by default.')
}

export async function getAllCoinsByKeyword(keyword: string) {
    const tokens = await fetchTokensByKeyword(keyword)
    const coins = tokens.map(
        (x) =>
            ({
                ...x,
                address: x.id,
                eth_address: x.id,
            } as Coin),
    )
    return coins
}

export async function getCoinInfo(id: string) {
    return {
        id: 'xxx',
        name: 'TEST Coin',
        symbol: 'TC',
        decimals: 18,
        eth_address: '',
    }
}

export async function getPriceStats(id: string, currency: Currency) {
    return []
}
