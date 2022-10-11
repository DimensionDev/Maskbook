import { first, groupBy } from 'lodash-unified'
import { getEnumAsArray, unreachable } from '@dimensiondev/kit'
import { DataProvider } from '@masknet/public-api'
import { CoinGeckoTrendingEVM, CoinMarketCap, NFTScanTrending, TrendingAPI, UniSwap } from '@masknet/web3-providers'
import { ChainId, chainResolver, NetworkType } from '@masknet/web3-shared-evm'
import { CRYPTOCURRENCY_MAP_EXPIRES_AT } from '../../constants/index.js'
import type { Coin, Currency, Stat, TagType, Trending } from '../../types/index.js'
import { isBlockedAddress, isBlockedId, isBlockedKeyword, resolveAlias, resolveCoinId } from './hotfix.js'

export async function getCoins(dataProvider: DataProvider): Promise<Coin[]> {
    switch (dataProvider) {
        case DataProvider.CoinGecko:
            return CoinGeckoTrendingEVM.getAllCoins()
        case DataProvider.CoinMarketCap:
            return CoinMarketCap.getAllCoins()
        case DataProvider.UniswapInfo:
            return UniSwap.getAllCoins()
        case DataProvider.NFTScan:
            return []
        default:
            unreachable(dataProvider)
    }
}

export async function getCoinsByKeyword(
    chainId: ChainId,
    dataProvider: DataProvider,
    keyword: string,
): Promise<Coin[]> {
    switch (dataProvider) {
        case DataProvider.UniswapInfo:
            return UniSwap.getCoinsByKeyword(chainId, keyword)
        case DataProvider.NFTScan:
            return keyword ? NFTScanTrending.getCoinsByKeyword(chainId, keyword) : []
        default:
            return []
    }
}

// #region check a specific coin is available on specific data provider
const ns = new Map<
    DataProvider,
    {
        // all of supported symbols
        supportedSymbolsSet: Set<string>

        // get all supported coins by symbol
        supportedSymbolIdsMap: Map<string, Coin[]>
        lastUpdated: Date
    }
>()

async function updateCache(chainId: ChainId, dataProvider: DataProvider, keyword?: string) {
    try {
        // uniswap update cache with keyword
        if (dataProvider === DataProvider.UniswapInfo || dataProvider === DataProvider.NFTScan) {
            if (!keyword) return
            if (!ns.has(dataProvider))
                ns.set(dataProvider, {
                    supportedSymbolsSet: new Set(),
                    supportedSymbolIdsMap: new Map(),
                    lastUpdated: new Date(),
                })
            const cache = ns.get(dataProvider)!
            const coins = (await getCoinsByKeyword(chainId, dataProvider, keyword)).filter(
                (x) => !isBlockedId(chainId, x.id, dataProvider),
            )
            if (coins.length) {
                cache.supportedSymbolsSet.add(keyword.toLowerCase())
                cache.supportedSymbolIdsMap.set(keyword.toLowerCase(), coins)
                cache.lastUpdated = new Date()
            }
            return
        }

        // other providers fetch all of supported coins
        const coins = (await getCoins(dataProvider)).filter((x) => !isBlockedId(chainId, x.id, dataProvider))
        const coinsGrouped = groupBy(coins, (x) => x.symbol.toLowerCase())
        ns.set(dataProvider, {
            supportedSymbolsSet: new Set<string>(Object.keys(coinsGrouped)),
            supportedSymbolIdsMap: new Map(Object.entries(coinsGrouped).map(([symbol, coins]) => [symbol, coins])),
            lastUpdated: new Date(),
        })
    } catch {
        console.error('failed to update cache')
    }
}

function isCacheExpired(dataProvider: DataProvider) {
    const lastUpdated = ns.get(dataProvider)?.lastUpdated.getTime() ?? 0
    return Date.now() - lastUpdated > CRYPTOCURRENCY_MAP_EXPIRES_AT
}

async function checkAvailabilityOnDataProvider(
    chainId: ChainId,
    keyword: string,
    type: TagType,
    dataProvider: DataProvider,
) {
    if (isBlockedKeyword(type, keyword)) return false
    // for uniswap, and NFTScan, we need to check availability by fetching token info dynamically
    if (dataProvider === DataProvider.UniswapInfo || dataProvider === DataProvider.NFTScan)
        await updateCache(chainId, dataProvider, keyword)
    // cache never built before update in blocking way
    else if (!ns.has(dataProvider)) await updateCache(chainId, dataProvider, keyword)
    // data fetched before update in non-blocking way
    else if (isCacheExpired(dataProvider)) updateCache(chainId, dataProvider, keyword)
    const symbols = ns.get(dataProvider)?.supportedSymbolsSet
    return symbols?.has(resolveAlias(chainId, keyword, dataProvider).toLowerCase()) ?? false
}

export async function getAvailableDataProviders(chainId: ChainId, type?: TagType, keyword?: string) {
    const networkType = chainResolver.networkType(chainId)
    const isMainnet = chainResolver.isMainnet(chainId)
    if (!isMainnet) return []
    if (!type || !keyword)
        return getEnumAsArray(DataProvider)
            .filter((x) => (isMainnet ? true : x.value !== DataProvider.UniswapInfo))
            .map((y) => y.value)
    const checked = await Promise.all(
        getEnumAsArray(DataProvider)
            .filter((x) => (x.value === DataProvider.UniswapInfo ? networkType === NetworkType.Ethereum : true))
            .map(
                async (x) =>
                    [
                        x.value,
                        await checkAvailabilityOnDataProvider(
                            chainId,
                            resolveAlias(chainId, keyword, x.value),
                            type,
                            x.value,
                        ),
                    ] as const,
            ),
    )
    return checked.filter(([, y]) => y).map(([x]) => x)
}

export async function getAvailableCoins(chainId: ChainId, keyword: string, type: TagType, dataProvider: DataProvider) {
    if (!(await checkAvailabilityOnDataProvider(chainId, keyword, type, dataProvider))) return []
    const ids = ns.get(dataProvider)?.supportedSymbolIdsMap
    const alias = resolveAlias(chainId, keyword, dataProvider).toLowerCase()
    return ids?.get(alias)?.filter((x) => !isBlockedAddress(chainId, x.address || x.contract_address || '')) ?? []
}
// #endregion

// #region get trending info
export async function getCoinTrendingById(
    chainId: ChainId,
    id: string,
    currency: Currency,
    dataProvider: DataProvider,
): Promise<Trending> {
    switch (dataProvider) {
        case DataProvider.CoinGecko:
            return CoinGeckoTrendingEVM.getCoinTrendingById(chainId, id, currency)
        case DataProvider.CoinMarketCap:
            return CoinMarketCap.getCoinTrendingById(chainId, id, currency)
        case DataProvider.UniswapInfo:
            return UniSwap.getCoinTrendingById(chainId, id, currency)
        case DataProvider.NFTScan:
            return NFTScanTrending.getCoinTrendingById(chainId, id, currency)
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

    const coinId = resolveCoinId(chainId, resolveAlias(chainId, keyword, dataProvider), dataProvider) ?? coin.id
    return getCoinTrendingById(chainId, coinId, currency, dataProvider)
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
            return []
    }
}
// #endregion
