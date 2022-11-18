import { compact, uniq, uniqBy } from 'lodash-es'
import { attemptUntil, TokenType } from '@masknet/web3-shared-base'
import { DataProvider } from '@masknet/public-api'
import { ChainId, getCoinGeckoConstants } from '@masknet/web3-shared-evm'
import { COINGECKO_CHAIN_ID_LIST, COINGECKO_URL_BASE } from '../constants.js'
import { getCommunityLink, isMirroredKeyword } from '../../trending/helpers.js'
import { fetchJSON } from '../../helpers.js'
import type { TrendingAPI } from '../../types/index.js'
import { getAllCoins, getCoinInfo, getPriceStats as getStats, getThumbCoins } from './base.js'
import type { Platform } from '../types.js'
import { resolveCoinGeckoChainId } from '../helpers.js'
import { FuseTrendingAPI } from '../../fuse/index.js'
import { COIN_RECOMMENDATION_SIZE, VALID_TOP_RANK } from '../../trending/constants.js'

export class CoinGeckoTrending_API implements TrendingAPI.Provider<ChainId> {
    private fuse = new FuseTrendingAPI()
    private coins: Map<string, TrendingAPI.Coin> = new Map()

    private async createCoins() {
        if (this.coins.size) return

        const coins = await this.getAllCoins()
        coins.forEach((x) => this.coins.set(x.id, x))
    }

    private async getSupportedPlatform() {
        const response = await fetchJSON<Platform[]>(`${COINGECKO_URL_BASE}/asset_platforms`)
        return response.filter((x) => x.id && x.chain_identifier) ?? []
    }

    async getAllCoins(): Promise<TrendingAPI.Coin[]> {
        const coins = await getAllCoins()
        return coins.map((coin) => ({ ...coin, type: TokenType.Fungible }))
    }

    async getCoinsByKeyword(chainId: ChainId, keyword: string): Promise<TrendingAPI.Coin[]> {
        try {
            await this.createCoins()
            const coinThumbs = await getThumbCoins(keyword)
            return compact(
                coinThumbs
                    .filter((x) => x?.market_cap_rank && x.market_cap_rank < VALID_TOP_RANK)
                    .map((y) => this.coins.get(y.id)),
            ).slice(0, COIN_RECOMMENDATION_SIZE)
        } catch {
            const coins = await this.fuse.getSearchableItems(this.getAllCoins)
            return coins
                .search(keyword)
                .map((x) => x.item)
                .slice(0, COIN_RECOMMENDATION_SIZE)
        }
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
                chainId: platforms.find((x) => x.id === key)?.chain_identifier ?? resolveCoinGeckoChainId(key),
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
                contract_address: info.contract_address,
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

    async getCoinNameByAddress(address: string): Promise<{ name: string; chainId: ChainId } | undefined> {
        return attemptUntil(
            COINGECKO_CHAIN_ID_LIST.map((chainId) => async () => {
                try {
                    const { PLATFORM_ID = '' } = getCoinGeckoConstants(chainId)
                    const requestPath = `${COINGECKO_URL_BASE}/coins/${PLATFORM_ID}/contract/${address.toLowerCase()}`
                    const response = await fetchJSON<{ name: string; error: string }>(requestPath)
                    return response.error ? undefined : { name: response.name, chainId }
                } catch {
                    return undefined
                }
            }),
            undefined,
        )
    }

    async getCoinPriceStats(
        chainId: ChainId,
        coinId: string,
        currency: TrendingAPI.Currency,
        days: number,
    ): Promise<TrendingAPI.Stat[]> {
        return (await getStats(coinId, currency.id, days)).prices
    }

    getTokenInfo(tokenSymbol: string): Promise<TrendingAPI.TokenInfo> {
        throw new Error('To be implemented.')
    }
}
