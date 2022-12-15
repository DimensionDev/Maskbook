import { first } from 'lodash-es'
import { SourceType } from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import { CoinGeckoTrending, CoinMarketCap, NFTScanTrending, UniSwap } from '@masknet/web3-providers'
import { TrendingAPI } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { Coin, Currency, Stat, TagType, Trending } from '../../types/index.js'
import { isBlockedAddress, isBlockedKeyword, resolveKeyword, resolveCoinId } from './hotfix.js'

export async function getCoinsByKeyword(chainId: ChainId, keyword: string, dataProvider: SourceType): Promise<Coin[]> {
    switch (dataProvider) {
        case SourceType.CoinGecko:
            return CoinGeckoTrending.getCoinsByKeyword(chainId, keyword)
        case SourceType.CoinMarketCap:
            return CoinMarketCap.getCoinsByKeyword(chainId, keyword)
        case SourceType.UniswapInfo:
            return UniSwap.getCoinsByKeyword(chainId, keyword)
        case SourceType.NFTScan:
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
    dataProvider: SourceType,
) {
    try {
        if (isBlockedKeyword(type, keyword)) return false
        const coins = await getCoinsByKeyword(chainId, resolveKeyword(chainId, keyword, dataProvider), dataProvider)
        return !!coins.length
    } catch {
        return false
    }
}

export async function getAvailableCoins(chainId: ChainId, keyword: string, type: TagType, dataProvider: SourceType) {
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

export async function getCoinTrendingByKeyword(
    chainId: ChainId,
    keyword: string,
    tagType: TagType,
    currency: Currency,
    dataProvider: SourceType,
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
