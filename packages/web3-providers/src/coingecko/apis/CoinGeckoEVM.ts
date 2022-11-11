import { uniq, uniqBy } from 'lodash-es'
import { DataProvider } from '@masknet/public-api'
import { HubIndicator, HubOptions, TokenType, attemptUntil } from '@masknet/web3-shared-base'
import { ChainId, getCoinGeckoConstants, isNativeTokenAddress, isValidAddress } from '@masknet/web3-shared-evm'
import { getCommunityLink, isMirroredKeyword, resolveChainId, resolveCoinAddress } from '../../cmc/helper.js'
import { fetchJSON } from '../../helpers.js'
import type { PriceAPI, TrendingAPI } from '../../types/index.js'
import { getAllCoins, getCoinInfo, getPriceStats as getStats, getTokenPrice, getTokenPriceByCoinId } from './base.js'
import { COINGECKO_URL_BASE } from '../constants.js'
import { resolveChain } from '../helper.js'
import type { Platform } from '../type.js'
import { FuseTrendingAPI } from '../../fuse/index.js'

export class CoinGeckoTrendingEVM_API implements TrendingAPI.Provider<ChainId> {
    private fuse = new FuseTrendingAPI()

    private async getSupportedPlatform() {
        const requestPath = `${COINGECKO_URL_BASE}/asset_platforms`
        const response = await fetchJSON<Platform[]>(requestPath)
        return response.filter((x) => x.id && x.chain_identifier) ?? []
    }

    async getAllCoins(): Promise<TrendingAPI.Coin[]> {
        const coins = await getAllCoins()
        return coins.map((coin) => ({ ...coin, type: TokenType.Fungible }))
    }

    async getCoinsByKeyword(chainId: ChainId, keyword: string): Promise<TrendingAPI.Coin[]> {
        const coins = await this.fuse.getSearchableItems(this.getAllCoins)
        return coins.search(keyword).map((x) => x.item)
    }

    async getCoinTrending(chainId: ChainId, id: string, currency: TrendingAPI.Currency): Promise<TrendingAPI.Trending> {
        const info = await getCoinInfo(id)
        if ('error' in info) throw new Error(info.error)

        const platform_url = `https://www.coingecko.com/en/coins/${info.id}`
        const twitter_url = info.links.twitter_screen_name
            ? `https://twitter.com/${info.links.twitter_screen_name}`
            : ''
        const facebook_url = info.links.facebook_username ? `https://facebook.com/${info.links.facebook_username}` : ''
        const telegram_url = info.links.telegram_channel_identifier
            ? `https://t.me/${info.links.telegram_channel_identifier}`
            : ''

        const platforms = await this.getSupportedPlatform()

        return {
            lastUpdated: info.last_updated,
            dataProvider: DataProvider.CoinGecko,
            contracts: Object.entries(info.platforms).map(([key, address]) => ({
                chainId: platforms.find((x) => x.id === key)?.chain_identifier ?? resolveChain(key),
                address,
            })),
            currency,
            coin: {
                id,
                name: info.name,
                symbol: info.symbol.toUpperCase(),
                type: TokenType.Fungible,
                is_mirrored: isMirroredKeyword(info.symbol),

                // TODO: use current language setting
                description: info.description.en,
                market_cap_rank: info.market_cap_rank,
                image_url: info.image.small,
                tags: info.categories.filter(Boolean),
                announcement_urls: info.links.announcement_url.filter(Boolean),
                community_urls: getCommunityLink(
                    uniqBy(
                        [
                            twitter_url,
                            facebook_url,
                            telegram_url,
                            info.links.subreddit_url,
                            ...info.links.chat_url,
                            ...info.links.official_forum_url,
                        ].filter(Boolean),
                        (x) => x.toLowerCase(),
                    ),
                ),
                source_code_urls: Object.values(info.links.repos_url).flatMap((x) => x),
                home_urls: info.links.homepage.filter(Boolean),
                blockchain_urls: uniq(
                    [platform_url, ...info.links.blockchain_site].filter(Boolean).map((url) => url.toLowerCase()),
                ),
                platform_url,
                facebook_url,
                twitter_url,
                telegram_url,
                contract_address:
                    resolveCoinAddress(chainId, id, DataProvider.CoinGecko) ??
                    info.contract_address ??
                    info.platforms[
                        Object.keys(info.platforms).find(
                            (x) => resolveChainId(x, DataProvider.CoinGecko) === chainId,
                        ) ?? ''
                    ],
            },
            market: (() => {
                const entries = Object.entries(info.market_data).map(([key, value]) => {
                    if (value && typeof value === 'object') {
                        return [key, value[currency.id] ?? 0]
                    }
                    return [key, value]
                })
                return Object.fromEntries(entries)
            })(),
            tickers: info.tickers.slice(0, 30).map((x) => ({
                logo_url: x.market.logo,
                trade_url: x.trade_url,
                market_name: x.market.name,
                base_name: x.base,
                target_name: x.target,
                price: x.converted_last.usd,
                volume: x.converted_volume.usd,
                score: x.trust_score,
                updated: new Date(x.timestamp),
            })),
        }
    }

    async getCoinPriceStats(
        chainId: ChainId,
        coinId: string,
        currency: TrendingAPI.Currency,
        days: number,
    ): Promise<TrendingAPI.Stat[]> {
        return (await getStats(coinId, currency.id, days)).prices
    }

    async getCoinIdByAddress(
        address: string,
        chainIdList: ChainId[],
    ): Promise<{ coinId: string; chainId: ChainId } | undefined> {
        return attemptUntil(
            chainIdList.map((chainId) => async () => {
                try {
                    const { PLATFORM_ID = '' } = getCoinGeckoConstants(chainId)
                    const requestPath = `${COINGECKO_URL_BASE}/coins/${PLATFORM_ID}/contract/${address}`
                    const response = await fetchJSON<{ id: string; error: string }>(requestPath)
                    console.log({ response }, response.id)
                    return response.error ? undefined : { coinId: response.id, chainId }
                } catch {
                    return undefined
                }
            }),
            undefined,
        )
    }
}

export class CoinGeckoPriceEVM_API implements PriceAPI.Provider<ChainId> {
    async getFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        options?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<number> {
        const { PLATFORM_ID = '', COIN_ID = '' } = getCoinGeckoConstants(options?.chainId ?? chainId)

        if (isNativeTokenAddress(address) || !isValidAddress(address)) {
            return getTokenPriceByCoinId(COIN_ID, options?.currencyType)
        }
        return getTokenPrice(PLATFORM_ID, address, options?.currencyType)
    }
}
