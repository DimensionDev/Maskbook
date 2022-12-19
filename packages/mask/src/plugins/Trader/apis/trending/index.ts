import { SourceType, NonFungibleCollectionOverview, NonFungibleTokenActivity } from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import { CoinGeckoTrending, CoinMarketCap, NFTScanTrending, UniSwap } from '@masknet/web3-providers'
import { TrendingAPI } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { Currency, Stat, Trending } from '../../types/index.js'

export async function getCoinInfoByAddress(address: string): Promise<TrendingAPI.CoinInfo | undefined> {
    return CoinGeckoTrending.getCoinInfoByAddress(address)
}

// #region get trending info
export async function getCoinTrending(
    chainId: ChainId,
    id: string,
    currency: Currency,
    dataProvider: SourceType,
): Promise<Trending | undefined> {
    switch (dataProvider) {
        case SourceType.CoinGecko:
            return CoinGeckoTrending.getCoinTrending(chainId, id, currency)
        case SourceType.CoinMarketCap:
            return CoinMarketCap.getCoinTrending(chainId, id, currency)
        case SourceType.UniswapInfo:
            return UniSwap.getCoinTrending(chainId, id, currency)
        case SourceType.NFTScan:
            return NFTScanTrending.getCoinTrending(chainId, id, currency)
        default:
            return
    }
}
// #endregion

// #region get price stats info
export async function getPriceStats(
    chainId: ChainId,
    id: string,
    currency: Currency,
    days: number,
    dataProvider: SourceType,
): Promise<Stat[]> {
    switch (dataProvider) {
        case SourceType.CoinGecko:
            return CoinGeckoTrending.getCoinPriceStats(
                chainId,
                id,
                currency,
                days === TrendingAPI.Days.MAX ? 11430 : days,
            )
        case SourceType.CoinMarketCap:
            return CoinMarketCap.getCoinPriceStats(chainId, id, currency, days)
        case SourceType.UniswapInfo:
            return UniSwap.getCoinPriceStats(chainId, id, currency, days)
        case SourceType.NFTScan:
            return NFTScanTrending.getCoinPriceStats(chainId, id, currency, days)
        default:
            return EMPTY_LIST
    }
}
// #endregion

// #region get nft trending overview
export async function getNFT_TrendingOverview(
    chainId: Web3Helper.ChainIdAll,
    id: string,
): Promise<NonFungibleCollectionOverview | undefined> {
    return NFTScanTrending.getCollectionOverview(chainId, id)
}
// #endregion

// #region get nft trending activities
export async function getNonFungibleTokenActivities(
    chainId: Web3Helper.ChainIdAll,
    contractAddress: string,
    pageIndex: number,
): Promise<NonFungibleTokenActivity[] | undefined> {
    return NFTScanTrending.getCoinActivities(chainId, contractAddress, pageIndex)
}
// #endregion
