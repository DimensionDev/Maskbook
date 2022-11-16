import type { TrendingAPI } from '../index.js'
import { fetchJSON } from '../helpers.js'
import { TOKEN_VIEW_ROOT_URL, INTERVAL } from './constants.js'
import type { ChainId } from '@masknet/web3-shared-evm'

export class NomicsAPI implements TrendingAPI.Provider<ChainId> {
    getAllCoins(): Promise<TrendingAPI.Coin[]> {
        throw new Error('To be implemented.')
    }
    getCoinsByKeyword(chainId: ChainId, keyword: string): Promise<TrendingAPI.Coin[]> {
        throw new Error('To be implemented.')
    }
    getCoinTrending(chainId: ChainId, id: string, currency: TrendingAPI.Currency): Promise<TrendingAPI.Trending> {
        throw new Error('To be implemented.')
    }
    getCoinPriceStats(
        chainId: ChainId,
        id: string,
        currency: TrendingAPI.Currency,
        days: number,
    ): Promise<TrendingAPI.Stat[]> {
        throw new Error('To be implemented.')
    }
    async getCoinMarketInfo(tokenSymbol: string): Promise<TrendingAPI.MarketInfo> {
        const response = await fetchJSON<{ items: TrendingAPI.MarketInfo[] } | undefined>(
            `${TOKEN_VIEW_ROOT_URL}&symbols=${tokenSymbol}&interval=${INTERVAL}`,
        )
        const marketInfo = response?.items?.[0]
        if (!marketInfo) throw new Error('Failed to fetch market info.')
        return marketInfo
    }
}
