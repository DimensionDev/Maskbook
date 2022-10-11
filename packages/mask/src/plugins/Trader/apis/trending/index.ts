import { getEnumAsArray, unreachable } from '@dimensiondev/kit'
import { DataProvider } from '@masknet/public-api'
import { CoinGeckoTrendingEVM, CoinMarketCap, NFTScanTrending, TrendingAPI, UniSwap } from '@masknet/web3-providers'
import { ChainId, chainResolver, NetworkType } from '@masknet/web3-shared-evm'
import { first, groupBy } from 'lodash-unified'
import { CRYPTOCURRENCY_MAP_EXPIRES_AT } from '../../constants/index.js'
import type { Coin, CommunityUrls, Currency, Stat, TagType, Trending } from '../../types/index.js'
import { isBlockedAddress, isBlockedId, isBlockedKeyword, resolveAlias, resolveCoinId } from './hotfix.js'

/**
 * Get supported currencies of specific data provider
 * @param dataProvider
 */
export async function getCurrencies(dataProvider: DataProvider): Promise<Currency[]> {
    switch (dataProvider) {
        case DataProvider.CoinGecko:
            return CoinGeckoTrendingEVM.getCurrencies()
        case DataProvider.CoinMarketCap:
            return CoinMarketCap.getCurrencies()
        case DataProvider.UniswapInfo:
            return UniSwap.getCurrencies()
        case DataProvider.NFTScan:
            throw new Error('Not implemented yet.')
        default:
            unreachable(dataProvider)
    }
}

export async function getCoins(dataProvider: DataProvider): Promise<Coin[]> {
    switch (dataProvider) {
        case DataProvider.CoinGecko:
            return CoinGeckoTrendingEVM.getCoins()
        case DataProvider.CoinMarketCap:
            return CoinMarketCap.getCoins()
        case DataProvider.UniswapInfo:
            return UniSwap.getCoins()
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
            return keyword ? NFTScanTrending.getCoins(keyword) : []
        default:
            return []
    }
}

// #region check a specific coin is available on specific data provider
const coinNamespace = new Map<
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
            if (!coinNamespace.has(dataProvider))
                coinNamespace.set(dataProvider, {
                    supportedSymbolsSet: new Set(),
                    supportedSymbolIdsMap: new Map(),
                    lastUpdated: new Date(),
                })
            const cache = coinNamespace.get(dataProvider)!
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
        coinNamespace.set(dataProvider, {
            supportedSymbolsSet: new Set<string>(Object.keys(coinsGrouped)),
            supportedSymbolIdsMap: new Map(Object.entries(coinsGrouped).map(([symbol, coins]) => [symbol, coins])),
            lastUpdated: new Date(),
        })
    } catch {
        console.error('failed to update cache')
    }
}

function isCacheExpired(dataProvider: DataProvider) {
    const lastUpdated = coinNamespace.get(dataProvider)?.lastUpdated.getTime() ?? 0
    return Date.now() - lastUpdated > CRYPTOCURRENCY_MAP_EXPIRES_AT
}

function getCommunityLink(links: string[]): CommunityUrls {
    return links.map((x) => {
        if (x.includes('twitter')) return { type: 'twitter', link: x }
        if (x.includes('t.me')) return { type: 'telegram', link: x }
        if (x.includes('facebook')) return { type: 'facebook', link: x }
        if (x.includes('discord')) return { type: 'discord', link: x }
        if (x.includes('reddit')) return { type: 'reddit', link: x }
        return { type: 'other', link: x }
    })
}

export async function checkAvailabilityOnDataProvider(
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
    else if (!coinNamespace.has(dataProvider)) await updateCache(chainId, dataProvider, keyword)
    // data fetched before update in non-blocking way
    else if (isCacheExpired(dataProvider)) updateCache(chainId, dataProvider, keyword)
    const symbols = coinNamespace.get(dataProvider)?.supportedSymbolsSet
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
    const ids = coinNamespace.get(dataProvider)?.supportedSymbolIdsMap
    const alias = resolveAlias(chainId, keyword, dataProvider).toLowerCase()
    return ids?.get(alias)?.filter((x) => !isBlockedAddress(chainId, x.address || x.contract_address || '')) ?? []
}
// #endregion

// #region get trending info
async function getCoinTrending(
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

export async function getCoinTrendingById(
    chainId: ChainId,
    id: string,
    currency: Currency,
    dataProvider: DataProvider,
) {
    return getCoinTrending(chainId, id, currency, dataProvider)
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
            return CoinGeckoTrendingEVM.getPriceStats(
                chainId,
                id,
                currency,
                days === TrendingAPI.Days.MAX ? 11430 : days,
            )
        case DataProvider.CoinMarketCap:
            return CoinMarketCap.getPriceStats(chainId, id, currency, days)
        case DataProvider.UniswapInfo:
            return UniSwap.getPriceStats(chainId, id, currency, days)
        case DataProvider.NFTScan:
            return NFTScanTrending.getPriceStats(chainId, id, currency, days)
        default:
            return []
    }
}
// #endregion
