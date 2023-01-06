import { SourceType, NonFungibleCollectionOverview, NonFungibleTokenActivity } from '@masknet/web3-shared-base'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
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
    pluginID: NetworkPluginID,
    chainId: Web3Helper.ChainIdAll,
    id: string,
    currency: Currency,
    dataProvider: SourceType,
): Promise<Trending | undefined> {
    switch (dataProvider) {
        case SourceType.CoinGecko:
            return CoinGeckoTrending.getCoinTrending(pluginID, chainId, id, currency)
        case SourceType.CoinMarketCap:
            return CoinMarketCap.getCoinTrending(pluginID, chainId, id, currency)
        case SourceType.UniswapInfo:
            return UniSwap.getCoinTrending(pluginID, chainId, id, currency)
        case SourceType.NFTScan:
            return NFTScanTrending.getCoinTrending(pluginID, chainId, id, currency)
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
    pluginID: NetworkPluginID,
    chainId: Web3Helper.ChainIdAll,
    address: string,
): Promise<NonFungibleCollectionOverview | undefined> {
    return NFTScanTrending.getCollectionOverview(pluginID, chainId, address)
}
// #endregion

// #region get nft trending activities
export async function getNonFungibleTokenActivities(
    pluginID: NetworkPluginID,
    chainId: Web3Helper.ChainIdAll,
    contractAddress: string,
    cursor: string,
): Promise<{ content: NonFungibleTokenActivity[]; cursor: string } | undefined> {
    return NFTScanTrending.getCoinActivities(pluginID, chainId, contractAddress, cursor)
}
// #endregion
