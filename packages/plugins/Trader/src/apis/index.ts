import { EMPTY_LIST } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { CoinGeckoTrending } from '@masknet/web3-providers'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { SourceType } from '@masknet/web3-shared-base'
import type { Currency, Stat, Trending } from '../types/index.js'

export async function getCoinInfoByAddress(address: string): Promise<TrendingAPI.CoinInfo | undefined> {
    return CoinGeckoTrending.getCoinInfoByAddress(address)
}

// #region get trending info
export async function getCoinTrending(
    result: Web3Helper.TokenResultAll,
    currency: Currency,
): Promise<Trending | undefined> {
    const { chainId, source, id = '' } = result
    switch (source) {
        case SourceType.CoinGecko:
            return CoinGeckoTrending.getCoinTrending(chainId, id, currency)

        default:
            return
    }
}
// #endregion

// #region get price stats info
export async function getPriceStats(
    chainId: Web3Helper.ChainIdAll,
    id: string,
    currency: Currency,
    days: number,
    dataProvider: SourceType,
): Promise<Stat[]> {
    switch (dataProvider) {
        case SourceType.CoinGecko:
            return CoinGeckoTrending.getCoinPriceStats(id, currency, days)
        default:
            return EMPTY_LIST
    }
}
// #endregion
