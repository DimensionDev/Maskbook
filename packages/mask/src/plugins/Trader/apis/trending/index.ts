import { first } from 'lodash-unified'
import { getEnumAsArray, unreachable } from '@dimensiondev/kit'
import { DataProvider } from '@masknet/public-api'
import { EMPTY_LIST } from '@masknet/shared-base'
import { CoinGeckoTrendingEVM, CoinMarketCap, NFTScanTrending, TrendingAPI, UniSwap } from '@masknet/web3-providers'
import { ChainId, chainResolver, NetworkType } from '@masknet/web3-shared-evm'
import type { Coin, Currency, Stat, TagType, Trending } from '../../types/index.js'
import { isBlockedAddress, isBlockedKeyword, resolveKeyword, resolveCoinId } from './hotfix.js'

export async function getCoinsByKeyword(
    chainId: ChainId,
    keyword: string,
    dataProvider: DataProvider,
): Promise<Coin[]> {
    switch (dataProvider) {
        case DataProvider.CoinGecko:
            return CoinGeckoTrendingEVM.getCoinsByKeyword(chainId, keyword)
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

export async function getAvailableDataProviders(chainId: ChainId, type?: TagType, keyword?: string) {
    const networkType = chainResolver.networkType(chainId)
    const isMainnet = chainResolver.isMainnet(chainId)

    if (!type || !keyword)
        return getEnumAsArray(DataProvider)
            .filter((x) => (isMainnet ? true : x.value !== DataProvider.UniswapInfo))
            .map((y) => y.value)

    // Check if the keyword is a numeric string
    if (!Number.isNaN(Number(keyword))) return EMPTY_LIST

    const checked = await Promise.all(
        getEnumAsArray(DataProvider)
            .filter((x) => (x.value === DataProvider.UniswapInfo ? networkType === NetworkType.Ethereum : true))
            .map(
                async (x) =>
                    [
                        x.value,
                        await checkAvailabilityOnDataProvider(
                            chainId,
                            resolveKeyword(chainId, keyword, x.value),
                            type,
                            x.value,
                        ),
                    ] as const,
            ),
    )
    return checked.filter(([, y]) => y).map(([x]) => x)
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
            return CoinGeckoTrendingEVM.getCoinTrending(chainId, id, currency)
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

    // prefer coins on the ethereum network
    const coin = coins.find((x) => x.contract_address) ?? first(coins)
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
            return CoinGeckoTrendingEVM.getCoinPriceStats(
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
