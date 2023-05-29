import { SourceType, type NonFungibleCollectionOverview, attemptUntil } from '@masknet/web3-shared-base'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import {
    CoinGeckoTrending,
    CoinMarketCap,
    NFTScanTrending_EVM,
    NFTScanTrending_Solana,
    SimpleHashEVM,
} from '@masknet/web3-providers'
import { TrendingAPI } from '@masknet/web3-providers/types'
import type { ChainId as ChainIdEVM } from '@masknet/web3-shared-evm'
import type { ChainId as ChainIdSolana } from '@masknet/web3-shared-solana'
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
            return CoinMarketCap.getCoinTrending(chainId as ChainIdEVM, id, currency)

        case SourceType.NFTScan:
            return pluginID === NetworkPluginID.PLUGIN_SOLANA
                ? NFTScanTrending_Solana.getCoinTrending(chainId as ChainIdSolana, name, currency)
                : attemptUntil(
                      [SimpleHashEVM, NFTScanTrending_EVM].map(
                          (x) => () => x.getCoinTrending(chainId as ChainIdEVM, address, currency),
                      ),
                      undefined,
                  )

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
            return CoinGeckoTrending.getCoinPriceStats(
                chainId as ChainIdEVM,
                id,
                currency,
                days === TrendingAPI.Days.MAX ? 11430 : days,
            )
        case SourceType.CoinMarketCap:
            return CoinMarketCap.getCoinPriceStats(chainId as ChainIdEVM, id, currency, days)
        case SourceType.NFTScan:
            return NFTScanTrending_EVM.getCoinPriceStats(chainId as ChainIdEVM, id, currency, days)
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
        ? NFTScanTrending_Solana.getCollectionOverview(chainId as ChainIdSolana, result.name)
        : NFTScanTrending_EVM.getCollectionOverview(chainId as ChainIdEVM, result.address ?? '')
}
// #endregion

// #region get nft trending activities
export async function getNonFungibleTokenActivities(
    pluginID: NetworkPluginID,
    chainId: Web3Helper.ChainIdAll,
    contractAddress: string,
    cursor: string,
): Promise<{ content: Web3Helper.NonFungibleTokenActivityAll[]; cursor: string } | undefined> {
    return pluginID === NetworkPluginID.PLUGIN_SOLANA
        ? NFTScanTrending_Solana.getCoinActivities(chainId as ChainIdSolana, contractAddress, cursor)
        : NFTScanTrending_EVM.getCoinActivities(chainId as ChainIdEVM, contractAddress, cursor)
}
// #endregion
