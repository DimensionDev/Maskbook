import { CurrencyType, Price } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import type { PriceAPI, TrendingAPI } from '..'
import { uniq } from 'lodash-unified'
import { DataProvider } from '@masknet/public-api'
import { getCommunityLink, isMirroredKeyword, resolveChainId, resolveCoinAddress } from '../CoinMarketCap/helper'
import { getAllCoins, getAllCurrencies, getCoinInfo, getPriceStats as getStats } from './base-api'
import { COINGECKO_URL_BASE } from './constants'
import { resolveChain } from './helper'
import { fetchJSON } from '..'
import type { Platform } from './type'

export class CoinGeckoAPI implements PriceAPI.Provider, TrendingAPI.Provider<ChainId> {
    async getTokenPrice(platform_id: string, address: string, currencyType = CurrencyType.USD) {
        const price = await this.getTokenPrices(platform_id, [address], currencyType)

        return Number(price[address][currencyType]) ?? 0
    }

    async getTokenPrices(platform_id: string, contractAddresses: string[], currency = CurrencyType.USD) {
        const addressList = contractAddresses.join(',')
        const requestPath = urlcat(COINGECKO_URL_BASE, '/simple/token_price/:platform_id', {
            platform_id,
            ['contract_addresses']: addressList,
            ['vs_currencies']: currency,
        })
        return fetch(requestPath).then((r) => r.json() as Promise<Record<string, Price>>)
    }

    async getTokenPriceByCoinId(coin_id: string, currency = CurrencyType.USD) {
        const requestPath = urlcat(`${COINGECKO_URL_BASE}/simple/price`, { ids: coin_id, ['vs_currencies']: currency })
        const price = await fetch(requestPath).then(
            (r) => r.json() as Promise<Record<string, Record<CurrencyType, number>>>,
        )
        return price[coin_id][currency]
    }

    async getTokensPrice(listOfAddress: string[], currencyType = CurrencyType.USD) {
        const requestPath = `${COINGECKO_URL_BASE}/simple/price?ids=${listOfAddress}&vs_currencies=${currencyType}`
        const response = await fetch(requestPath).then(
            (r) => r.json() as Promise<Record<string, Record<CurrencyType, number>>>,
        )

        return Object.fromEntries(Object.keys(response).map((address) => [address, response[address][currencyType]]))
    }

    async getSupportedPlatform() {
        const requestPath = `${COINGECKO_URL_BASE}/asset_platforms`
        const response = await fetchJSON<Platform[]>(requestPath)

        return response.filter((x) => x.id && x.chain_identifier) ?? []
    }

    async getCoinTrending(chainId: ChainId, id: string, currency: TrendingAPI.Currency): Promise<TrendingAPI.Trending> {
        const info = await getCoinInfo(id)
        const platform_url = `https://www.coingecko.com/en/coins/${info.id}`
        const twitter_url = info.links.twitter_screen_name
            ? `https://twitter.com/${info.links.twitter_screen_name}`
            : ''
        const facebook_url = info.links.facebook_username ? `https://t.me/${info.links.facebook_username}` : ''
        const telegram_url = info.links.telegram_channel_identifier
            ? `https://t.me/${info.links.telegram_channel_identifier}`
            : ''

        const platforms = await this.getSupportedPlatform()

        return {
            lastUpdated: info.last_updated,
            dataProvider: DataProvider.COIN_GECKO,
            contracts: Object.entries(info.platforms).map(([key, address]) => ({
                chainId: platforms.find((x) => x.id === key)?.chain_identifier ?? resolveChain(key),
                address,
            })),
            currency,
            coin: {
                id,
                name: info.name,
                symbol: info.symbol.toUpperCase(),
                is_mirrored: isMirroredKeyword(info.symbol),

                // TODO: use current language setting
                description: info.description.en,
                market_cap_rank: info.market_cap_rank,
                image_url: info.image.small,
                tags: info.categories.filter(Boolean),
                announcement_urls: info.links.announcement_url.filter(Boolean),
                community_urls: getCommunityLink(
                    [
                        twitter_url,
                        facebook_url,
                        telegram_url,
                        info.links.subreddit_url,
                        ...info.links.chat_url,
                        ...info.links.official_forum_url,
                    ].filter(Boolean),
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
                    resolveCoinAddress(chainId, id, DataProvider.COIN_GECKO) ??
                    info.platforms[
                        Object.keys(info.platforms).find(
                            (x) => resolveChainId(x, DataProvider.COIN_GECKO) === chainId,
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

    getCoins(): Promise<TrendingAPI.Coin[]> {
        return getAllCoins()
    }

    async getCurrencies(): Promise<TrendingAPI.Currency[]> {
        const currencies = await getAllCurrencies()
        return currencies.map((x) => ({
            id: x,
            name: x.toUpperCase(),
        }))
    }

    async getPriceStats(
        chainId: ChainId,
        coinId: string,
        currency: TrendingAPI.Currency,
        days: number,
    ): Promise<TrendingAPI.Stat[]> {
        return (await getStats(coinId, currency.id, days)).prices
    }
}
