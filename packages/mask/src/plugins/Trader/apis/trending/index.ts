import { first, groupBy } from 'lodash-unified'
import type { Coin, CommunityUrls, Currency, Stat, TagType, Trending } from '../../types'
import { DataProvider } from '@masknet/public-api'
import { getEnumAsArray, unreachable } from '@dimensiondev/kit'
import { CRYPTOCURRENCY_MAP_EXPIRES_AT } from '../../constants'
import { isBlockedId, isBlockedKeyword, resolveAlias, resolveCoinId, isBlockedAddress } from './hotfix'
import { ChainId, chainResolver, NetworkType } from '@masknet/web3-shared-evm'
import { Days } from '../../SNSAdaptor/trending/PriceChartDaysControl'
import { CoinGecko, CoinMarketCap, UniSwap } from '@masknet/web3-providers'

/**
 * Get supported currencies of specific data provider
 * @param dataProvider
 */
export async function getCurrencies(dataProvider: DataProvider): Promise<Currency[]> {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            return CoinGecko.getCurrencies()
        case DataProvider.COIN_MARKET_CAP:
            return CoinMarketCap.getCurrencies()
        case DataProvider.UNISWAP_INFO:
            return UniSwap.getCurrencies()
        default:
            unreachable(dataProvider)
    }
}

export async function getCoins(dataProvider: DataProvider): Promise<Coin[]> {
    switch (dataProvider) {
        case DataProvider.COIN_GECKO:
            return CoinGecko.getCoins()
        case DataProvider.COIN_MARKET_CAP:
            return CoinMarketCap.getCoins()
        case DataProvider.UNISWAP_INFO:
            return UniSwap.getCoins()
        default:
            unreachable(dataProvider)
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
        if (dataProvider === DataProvider.UNISWAP_INFO) {
            if (!keyword) return
            if (!coinNamespace.has(dataProvider))
                coinNamespace.set(dataProvider, {
                    supportedSymbolsSet: new Set(),
                    supportedSymbolIdsMap: new Map(),
                    lastUpdated: new Date(),
                })
            const cache = coinNamespace.get(dataProvider)!
            const coins = (await UniSwap.getCoinsByKeyword(chainId, keyword)).filter(
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
    // for uniswap we check availability by fetching token info dynamically
    if (dataProvider === DataProvider.UNISWAP_INFO) await updateCache(chainId, dataProvider, keyword)
    // cache never built before update in blocking way
    else if (!coinNamespace.has(dataProvider)) await updateCache(chainId, dataProvider)
    // data fetched before update in non-blocking way
    else if (isCacheExpired(dataProvider)) updateCache(chainId, dataProvider)
    const symbols = coinNamespace.get(dataProvider)?.supportedSymbolsSet
    return symbols?.has(resolveAlias(chainId, keyword, dataProvider).toLowerCase()) ?? false
}

export async function getAvailableDataProviders(chainId: ChainId, type?: TagType, keyword?: string) {
    const networkType = chainResolver.chainNetworkType(chainId)
    const isMainnet = chainResolver.isMainnet(chainId)
    if (!isMainnet) return []
    if (!type || !keyword)
        return getEnumAsArray(DataProvider)
            .filter((x) => (isMainnet ? true : x.value !== DataProvider.UNISWAP_INFO))
            .map((y) => y.value)
    const checked = await Promise.all(
        getEnumAsArray(DataProvider)
            .filter((x) => (x.value === DataProvider.UNISWAP_INFO ? networkType === NetworkType.Ethereum : true))
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
    return (
        ids
            ?.get(resolveAlias(chainId, keyword, dataProvider).toLowerCase())
            ?.filter((x) => !isBlockedAddress(chainId, x.address || x.contract_address || '')) ?? []
    )
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
        case DataProvider.COIN_GECKO:
            return CoinGecko.getCoinTrending(chainId, id, currency)
        case DataProvider.COIN_MARKET_CAP:
            return CoinMarketCap.getCoinTrending(chainId, id, currency)
        case DataProvider.UNISWAP_INFO:
            return UniSwap.getCoinTrending(chainId, id, currency)
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

    return getCoinTrendingById(
        chainId,
        resolveCoinId(chainId, resolveAlias(chainId, keyword, dataProvider), dataProvider) ?? coin.id,
        currency,
        dataProvider,
    )
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
        case DataProvider.COIN_GECKO:
            return CoinGecko.getPriceStats(chainId, id, currency, days === Days.MAX ? 11430 : days)
        case DataProvider.COIN_MARKET_CAP:
            return CoinMarketCap.getPriceStats(chainId, id, currency, days)
        case DataProvider.UNISWAP_INFO:
            return UniSwap.getPriceStats(chainId, id, currency, days)
        default:
            return []
    }
}
// #endregion
