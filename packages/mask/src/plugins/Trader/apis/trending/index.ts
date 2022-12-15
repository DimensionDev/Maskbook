import { first } from 'lodash-es'
import { unreachable } from '@masknet/kit'
import { DataProvider } from '@masknet/public-api'
import { EMPTY_LIST } from '@masknet/shared-base'
import { CoinGeckoTrending, CoinMarketCap, NFTScanTrending, UniSwap } from '@masknet/web3-providers'
import { TrendingAPI } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { Coin, Currency, Stat, TagType, Trending } from '../../types/index.js'
import { isBlockedAddress, isBlockedKeyword, resolveKeyword, resolveCoinId } from './hotfix.js'

export async function getCoinsByKeyword(
    chainId: ChainId,
    keyword: string,
    dataProvider: DataProvider,
): Promise<Coin[]> {
    switch (dataProvider) {
        case DataProvider.CoinGecko:
            return CoinGeckoTrending.getCoinsByKeyword(chainId, keyword)
        case DataProvider.CoinMarketCap:
            return CoinMarketCap.getCoinsByKeyword(chainId, keyword)
        case DataProvider.UniswapInfo:
            return UniSwap.getCoinsByKeyword(chainId, keyword)
        case DataProvider.NFTScan:
            return keyword ? NFTScanTrending.getCoinsByKeyword(chainId, keyword) : EMPTY_LIST
        default:
            return EMPTY_LIST
    }
}

export async function getCoinInfoByAddress(
    chainId: ChainId,
    address: string,
): Promise<TrendingAPI.CoinInfo | undefined> {
    return CoinGeckoTrending.getCoinInfoByAddress(chainId, address)
}

async function checkAvailabilityOnDataProvider(
    chainId: ChainId,
    keyword: string,
    type: TagType,
    dataProvider: DataProvider,
) {
    try {
        if (isBlockedKeyword(type, keyword)) return false
        const coins = await getCoinsByKeyword(chainId, resolveKeyword(chainId, keyword, dataProvider), dataProvider)
        return !!coins.length
    } catch {
        return false
    }
}

export async function getAvailableCoins(chainId: ChainId, keyword: string, type: TagType, dataProvider: DataProvider) {
    if (!(await checkAvailabilityOnDataProvider(chainId, keyword, type, dataProvider))) return EMPTY_LIST
    const coins = await getCoinsByKeyword(chainId, resolveKeyword(chainId, keyword, dataProvider), dataProvider)
    return coins.filter((x) => !isBlockedAddress(chainId, x.address || x.contract_address || '')) ?? EMPTY_LIST
}
// #endregion

// #region get trending info
export async function getCoinTrending(
    chainId: ChainId,
    id: string,
    currency: Currency,
    dataProvider: DataProvider,
): Promise<Trending> {
    switch (dataProvider) {
        case DataProvider.CoinGecko:
            return CoinGeckoTrending.getCoinTrending(chainId, id, currency)
        case DataProvider.CoinMarketCap:
            return CoinMarketCap.getCoinTrending(chainId, id, currency)
        case DataProvider.UniswapInfo:
            return UniSwap.getCoinTrending(chainId, id, currency)
        case DataProvider.NFTScan:
            return NFTScanTrending.getCoinTrending(chainId, id, currency)
        default:
            unreachable(dataProvider)
    }
}

export async function getCoinTrendingByKeyword(
    chainId: ChainId,
    keyword: string,
    tagType: TagType,
    currency: Currency,
    dataProvider: DataProvider,
) {
    // check if the keyword is supported by given data provider
    const coins = await getAvailableCoins(chainId, keyword, tagType, dataProvider)
    if (!coins.length) return null

    // check this first coin
    const coin = first(coins)
    if (!coin) return null

    const coinId = resolveCoinId(chainId, resolveKeyword(chainId, keyword, dataProvider), dataProvider) ?? coin.id
    return getCoinTrending(chainId, coinId, currency, dataProvider)
}
// #endregion

// #region get price stats info
export async function getPriceStats(
    chainId: ChainId,
    id: string,
    currency: Currency,
    days: number,
    dataProvider: DataProvider,
): Promise<Stat[]> {
    switch (dataProvider) {
        case DataProvider.CoinGecko:
            return CoinGeckoTrending.getCoinPriceStats(
                chainId,
                id,
                currency,
                days === TrendingAPI.Days.MAX ? 11430 : days,
            )
        case DataProvider.CoinMarketCap:
            return CoinMarketCap.getCoinPriceStats(chainId, id, currency, days)
        case DataProvider.UniswapInfo:
            return UniSwap.getCoinPriceStats(chainId, id, currency, days)
        case DataProvider.NFTScan:
            return NFTScanTrending.getCoinPriceStats(chainId, id, currency, days)
        default:
            return EMPTY_LIST
    }
}
// #endregion
