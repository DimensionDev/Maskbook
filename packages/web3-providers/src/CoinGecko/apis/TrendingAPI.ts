import { uniq, uniqBy } from 'lodash-es'
import { NetworkPluginID, twitterDomainMigrate } from '@masknet/shared-base'
import { attemptUntil, TokenType, SourceType } from '@masknet/web3-shared-base'
import { ChainId, getCoinGeckoConstants, getTokenConstant, isNativeTokenSymbol } from '@masknet/web3-shared-evm'
import type { Web3Helper } from '@masknet/web3-helpers'
import { COINGECKO_CHAIN_ID_LIST, COINGECKO_URL_BASE } from '../constants.js'
import { getCommunityLink, isMirroredKeyword } from '../../Trending/helpers.js'
import { getCoinInfo, getPriceStats as getStats } from './base.js'
import type { CoinInfo, Platform } from '../types.js'
import { resolveCoinGeckoChainId } from '../helpers.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { TrendingAPI } from '../../entry-types.js'
import { EVMChainResolver } from '../../Web3/EVM/apis/ResolverAPI.js'

class CoinGeckoTrendingAPI implements TrendingAPI.Provider<Web3Helper.ChainIdAll> {
    private async getSupportedPlatform() {
        const response = await fetchJSON<Platform[]>(`${COINGECKO_URL_BASE}/asset_platforms`)
        return response.filter((x) => x.id && x.chain_identifier) ?? []
    }

    async getCoinInfoByAddress(address: string, chainId?: number): Promise<TrendingAPI.CoinInfo | undefined> {
        const chainIds = chainId ? [chainId] : COINGECKO_CHAIN_ID_LIST
        return attemptUntil(
            chainIds.map((chainId) => async () => {
                try {
                    const { PLATFORM_ID } = getCoinGeckoConstants(chainId)
                    if (!PLATFORM_ID) return
                    const requestPath = `${COINGECKO_URL_BASE}/coins/${PLATFORM_ID}/contract/${address.toLowerCase()}`
                    const response = await fetchJSON<{ name: string; id: string; error: string }>(requestPath)
                    return response.error ? undefined : { name: response.name, id: response.id, chainId }
                } catch {
                    return undefined
                }
            }),
            undefined,
        )
    }

    async getCoinTrending(
        chainId: Web3Helper.ChainIdAll,
        id: string,
        currency: TrendingAPI.Currency,
    ): Promise<TrendingAPI.Trending> {
        const info = await getCoinInfo(id)
        if ('error' in info) throw new Error(info.error)

        const platform_url = `https://www.coingecko.com/en/coins/${info.id}`
        const twitter_url =
            info.links.twitter_screen_name ?
                twitterDomainMigrate(`https://x.com/${info.links.twitter_screen_name}`)
            :   ''
        const facebook_url = info.links.facebook_username ? `https://facebook.com/${info.links.facebook_username}` : ''
        const telegram_url =
            info.links.telegram_channel_identifier ? `https://t.me/${info.links.telegram_channel_identifier}` : ''

        const platforms = await this.getSupportedPlatform()
        const avaxContracts = [
            {
                address: '0x1ce0c2827e2ef14d5c4f29a091d735a204794041',
                chainId: ChainId.BSC,
                pluginID: NetworkPluginID.PLUGIN_EVM,
            },
            {
                address: '0x4792c1ecb969b036eb51330c63bd27899a13d84e',
                chainId: ChainId.Moonbeam,
                pluginID: NetworkPluginID.PLUGIN_EVM,
            },
        ]

        return {
            lastUpdated: info.last_updated,
            dataProvider: SourceType.CoinGecko,
            contracts:
                info.id === 'avalanche-2' ?
                    avaxContracts
                :   Object.entries(info.platforms)
                        .map(([key, address]) => ({
                            chainId:
                                platforms.find((x) => x.id === key)?.chain_identifier ?? resolveCoinGeckoChainId(key),
                            address,
                            pluginID: key === 'solana' ? NetworkPluginID.PLUGIN_SOLANA : NetworkPluginID.PLUGIN_EVM,
                        }))
                        .filter((x) => x.chainId && x.address),
            currency,
            coin: {
                id,
                chainId: isNativeTokenSymbol(info.symbol) ? EVMChainResolver.chainId(info.name) : undefined,
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
                    EVMChainResolver.chainId(info.name) && isNativeTokenSymbol(info.symbol) ?
                        getTokenConstant(EVMChainResolver.chainId(info.name)!, 'NATIVE_TOKEN_ADDRESS')
                    :   info.contract_address,
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

    async getCoinPriceStats(coinId: string, currency: TrendingAPI.Currency, days: number): Promise<TrendingAPI.Stat[]> {
        return (await getStats(coinId, currency.id, days)).prices
    }

    getCoinMarketInfo(address: string): Promise<TrendingAPI.MarketInfo | undefined> {
        return attemptUntil(
            COINGECKO_CHAIN_ID_LIST.map((chainId) => async (): Promise<TrendingAPI.MarketInfo | undefined> => {
                try {
                    const { PLATFORM_ID = '' } = getCoinGeckoConstants(chainId)
                    const requestPath = `${COINGECKO_URL_BASE}/coins/${PLATFORM_ID}/contract/${address.toLowerCase()}`
                    const response = await fetchJSON<CoinInfo | { error: string }>(requestPath)
                    if ('error' in response) return
                    return { id: response.id, market_cap: response.market_data.market_cap.usd.toString() }
                } catch {
                    return undefined
                }
            }),
            undefined,
        )
    }
}
export const CoinGeckoTrending = new CoinGeckoTrendingAPI()
