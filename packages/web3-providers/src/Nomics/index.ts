import type { ChainId } from '@masknet/web3-shared-evm'
import { TOKEN_VIEW_ROOT_URL, INTERVAL } from './constants.js'
import type { TrendingAPI } from '../entry-types.js'
import { fetchJSON } from '../entry-helpers.js'

export class NomicsAPI implements TrendingAPI.Provider<ChainId> {
    getAllCoins(): Promise<TrendingAPI.Coin[]> {
        throw new Error('Method not implemented.')
    }
    getCoinsByKeyword(chainId: ChainId, keyword: string): Promise<TrendingAPI.Coin[]> {
        throw new Error('Method not implemented.')
    }
    getCoinInfoByAddress(address: string): Promise<TrendingAPI.CoinInfo | undefined> {
        throw new Error('To be implemented.')
    }
    getCoinTrending(chainId: ChainId, id: string, currency: TrendingAPI.Currency): Promise<TrendingAPI.Trending> {
        throw new Error('Method not implemented.')
    }
    getCoinPriceStats(
        chainId: ChainId,
        id: string,
        currency: TrendingAPI.Currency,
        days: number,
    ): Promise<TrendingAPI.Stat[]> {
        throw new Error('Method not implemented.')
    }
    async getCoinMarketInfo(symbol: string): Promise<TrendingAPI.MarketInfo> {
        const response = await fetchJSON<{ items: TrendingAPI.MarketInfo[] } | undefined>(
            `${TOKEN_VIEW_ROOT_URL}&symbols=${symbol}&interval=${INTERVAL}`,
        )
        const marketInfo = response?.items[0]
        if (!marketInfo) throw new Error('Failed to fetch market info.')
        return marketInfo
    }
}
