import type { TrendingAPI } from '../index.js'
import { fetchJSON } from '../helpers.js'
import { TOKEN_VIEW_ROOT_URL, INTERVAL } from './constants.js'
import type { ChainId } from '@masknet/web3-shared-evm'

export class NomicsTrendingAPI implements TrendingAPI.Provider<ChainId> {
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
    async getTokenInfo(tokenSymbol: string): Promise<TrendingAPI.TokenInfo> {
        const response = await fetchJSON<{ items: TrendingAPI.TokenInfo[] } | undefined>(
            `${TOKEN_VIEW_ROOT_URL}&symbols=${tokenSymbol}&interval=${INTERVAL}`,
        )

        return response?.items?.[0] as TrendingAPI.TokenInfo
    }
}
