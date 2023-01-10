import { SourceType, NonFungibleCollectionOverview, NonFungibleTokenActivity } from '@masknet/web3-shared-base'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import {
    CoinGeckoTrending,
    CoinMarketCap,
    NFTScanTrending_EVM,
    NFTScanTrending_Solana,
    UniSwap,
} from '@masknet/web3-providers'
import { TrendingAPI } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { Currency, Stat, Trending } from '../../types/index.js'

export async function getCoinInfoByAddress(address: string): Promise<TrendingAPI.CoinInfo | undefined> {
    return CoinGeckoTrending.getCoinInfoByAddress(address)
}

// #region get trending info
export async function getCoinTrending(
    result: Web3Helper.TokenResultAll,
    currency: Currency,
): Promise<Trending | undefined> {
    const { chainId, source, pluginID, id = '', name = '', address = '' } = result
    switch (source) {
        case SourceType.CoinGecko:
            return CoinGeckoTrending.getCoinTrending(chainId, id, currency)
        case SourceType.CoinMarketCap:
            return CoinMarketCap.getCoinTrending(chainId, id, currency)
        case SourceType.UniswapInfo:
            return UniSwap.getCoinTrending(chainId, id, currency)
        case SourceType.NFTScan:
            return pluginID === NetworkPluginID.PLUGIN_SOLANA
                ? NFTScanTrending_Solana.getCoinTrending(chainId, name, currency)
                : NFTScanTrending_EVM.getCoinTrending(chainId, address, currency)
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
            return NFTScanTrending_EVM.getCoinPriceStats(chainId, id, currency, days)
        default:
            return EMPTY_LIST
    }
}
// #endregion

// #region get nft trending overview
export async function getNFT_TrendingOverview(
    pluginID: NetworkPluginID,
    chainId: Web3Helper.ChainIdAll,
    result: Web3Helper.TokenResultAll,
): Promise<NonFungibleCollectionOverview | undefined> {
    return pluginID === NetworkPluginID.PLUGIN_SOLANA
        ? NFTScanTrending_Solana.getCollectionOverview(chainId, result.name)
        : NFTScanTrending_EVM.getCollectionOverview(chainId, result.address ?? '')
}
// #endregion

// #region get nft trending activities
export async function getNonFungibleTokenActivities(
    pluginID: NetworkPluginID,
    chainId: Web3Helper.ChainIdAll,
    contractAddress: string,
    cursor: string,
): Promise<
    | { content: Array<NonFungibleTokenActivity<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>; cursor: string }
    | undefined
> {
    return pluginID === NetworkPluginID.PLUGIN_SOLANA
        ? NFTScanTrending_Solana.getCoinActivities(chainId, contractAddress, cursor)
        : NFTScanTrending_EVM.getCoinActivities(chainId, contractAddress, cursor)
}
// #endregion
