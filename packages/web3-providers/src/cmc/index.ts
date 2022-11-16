import getUnixTime from 'date-fns/getUnixTime'
import { TokenType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { DataProvider } from '@masknet/public-api'
import { TrendingAPI } from '../types/index.js'
import { BTC_FIRST_LEGER_DATE, CMC_STATIC_BASE_URL, CMC_V1_BASE_URL, THIRD_PARTY_V1_BASE_URL } from './constants.js'
import { resolveCoinMarketCapChainId } from './helpers.js'
import { fetchJSON } from '../helpers.js'
import { getCommunityLink, isMirroredKeyword } from '../trending/helpers.js'
import type { Coin, Pair, ResultData, Status, QuotesInfo, CoinInfo } from './types.js'
import { FuseTrendingAPI } from '../fuse/index.js'

// #regin get quote info
export async function getQuotesInfo(id: string, currency: string) {
    const params = new URLSearchParams()
    params.append('id', id)
    params.append('convert', currency)

    try {
        const response = await fetch(`${THIRD_PARTY_V1_BASE_URL}/cryptocurrency/widget?${params.toString()}`, {
            cache: 'default',
        })
        return response.json() as Promise<{
            data: Record<string, QuotesInfo>
            status: Status
        }>
    } catch {
        return {
            data: null,
        }
    }
}
// #endregion

// #region get coin info
export async function getCoinInfo(id: string) {
    const params = new URLSearchParams('aux=urls,logo,description,tags,platform,date_added,notice,status')
    params.append('id', id)

    const response_ = await fetch(`${CMC_V1_BASE_URL}/cryptocurrency/info?${params.toString()}`, {
        cache: 'default',
    })
    const response = (await response_.json()) as {
        /** id, coin-info pair */
        data: Record<string, CoinInfo>
        status: Status
    }
    return {
        data: response.data[id],
        status: response.status,
    }
}
// #endregion

// #region latest market pairs

export async function getLatestMarketPairs(id: string, currency: string) {
    const params = new URLSearchParams(
        'aux=num_market_pairs,market_url,price_quote,effective_liquidity,market_score,market_reputation&limit=40&sort=cmc_rank&start=1',
    )
    params.append('convert', currency)
    params.append('id', id)

    try {
        const response = await fetch(`${CMC_V1_BASE_URL}/cryptocurrency/market-pairs/latest?${params.toString()}`, {
            cache: 'default',
        })
        return response.json() as Promise<{
            data: {
                id: number
                market_pairs: Pair[]
                name: string
                num_market_pairs: number
                symbol: string
            }
            status: Status
        }>
    } catch {
        return {
            data: {
                id,
                market_pairs: [] as Pair[],
                num_market_pairs: 0,
            },
        }
    }
}

// #endregion

export class CoinMarketCapAPI implements TrendingAPI.Provider<ChainId> {
    private fuse = new FuseTrendingAPI()

    private async getHistorical(
        id: string,
        currency: string,
        startDate: Date,
        endDate: Date,
        interval: TrendingAPI.HistoricalInterval,
    ) {
        const params = new URLSearchParams('format=chart_crypto_details')
        params.append('convert', currency)
        params.append('id', id)
        params.append('interval', interval)
        params.append('time_end', getUnixTime(endDate).toString())
        params.append('time_start', getUnixTime(startDate).toString())

        const response = await fetchJSON<
            ResultData<Record<string, Record<string, TrendingAPI.Stat>> | TrendingAPI.HistoricalCoinInfo>
        >(`${CMC_V1_BASE_URL}/cryptocurrency/quotes/historical?${params.toString()}`, {
            cache: 'default',
        })

        return response.data
    }

    async getAllCoins(): Promise<TrendingAPI.Coin[]> {
        const response = await fetchJSON<ResultData<Coin[]>>(
            `${CMC_V1_BASE_URL}/cryptocurrency/map?aux=status,platform&listing_status=active,untracked&sort=cmc_rank`,
            { cache: 'force-cache' },
        )
        if (!response.data) return []
        return response.data
            .filter((x) => x.status === 'active')
            .map((x) => ({
                id: String(x.id),
                name: x.name,
                symbol: x.symbol,
                type: TokenType.Fungible,
                contract_address: x.platform?.token_address,
                market_cap_rank: x.rank,
            }))
    }

    async getCoinsByKeyword(chainId: ChainId, keyword: string): Promise<TrendingAPI.Coin[]> {
        const coins = await this.fuse.getSearchableItems(this.getAllCoins)
        return coins
            .search(keyword)
            .map((x) => x.item)
            .slice(0, 10)
    }

    async getCoinTrending(chainId: ChainId, id: string, currency: TrendingAPI.Currency): Promise<TrendingAPI.Trending> {
        const currencyName = currency.name.toUpperCase()
        const [{ data: coinInfo, status }, { data: quotesInfo }, { data: market }] = await Promise.all([
            getCoinInfo(id),
            getQuotesInfo(id, currencyName),
            getLatestMarketPairs(id, currencyName),
        ])

        const contracts = coinInfo.contract_address.map(
            (x) =>
                ({
                    chainId: resolveCoinMarketCapChainId(x.platform.name),
                    address: x.contract_address,
                    icon_url: `${CMC_STATIC_BASE_URL}/img/coins/64x64/${x.platform.coin.id}.png`,
                } as TrendingAPI.Contract),
        )

        const trending: TrendingAPI.Trending = {
            lastUpdated: status.timestamp,
            platform: coinInfo.platform,
            contracts,
            coin: {
                id,
                name: coinInfo.name,
                symbol: coinInfo.symbol,
                type: TokenType.Fungible,
                is_mirrored: isMirroredKeyword(coinInfo.symbol),
                announcement_urls: coinInfo.urls.announcement?.filter(Boolean),
                tech_docs_urls: coinInfo.urls.technical_doc?.filter(Boolean),
                message_board_urls: coinInfo.urls.message_board?.filter(Boolean),
                source_code_urls: coinInfo.urls.source_code?.filter(Boolean),
                community_urls: getCommunityLink(
                    [
                        ...(coinInfo.urls.twitter ?? []),
                        ...(coinInfo.urls.reddit ?? []),
                        ...(coinInfo.urls.chat ?? []),
                    ].filter(Boolean),
                ),
                home_urls: coinInfo.urls.website?.filter(Boolean),
                blockchain_urls: [
                    `https://coinmarketcap.com/currencies/${coinInfo.slug}/`,
                    ...(coinInfo.urls.explorer ?? []),
                ].filter(Boolean),
                tags: coinInfo.tags ?? void 0,
                image_url: `${CMC_STATIC_BASE_URL}/img/coins/64x64/${id}.png`,
                platform_url: `https://coinmarketcap.com/currencies/${coinInfo.slug}/`,
                twitter_url: coinInfo.urls.twitter?.find((x) => x.includes('twitter')),
                telegram_url: coinInfo.urls.chat?.find((x) => x.includes('telegram')),
                market_cap_rank: quotesInfo?.[id]?.cmc_rank,
                description: coinInfo.description,
                contract_address: contracts.find((x) => x.chainId === chainId)?.address,
            },
            currency,
            dataProvider: DataProvider.CoinMarketCap,
            tickers: market.market_pairs
                .map((pair) => ({
                    logo_url: `${CMC_STATIC_BASE_URL}/img/exchanges/32x32/${pair.exchange.id}.png`,
                    trade_url: pair.market_url,
                    market_name: pair.exchange.name,
                    market_reputation: pair.market_reputation,
                    base_name: pair.market_pair_base.exchange_symbol,
                    target_name: pair.market_pair_quote.exchange_symbol,
                    price:
                        pair.market_pair_base.currency_id === market.id
                            ? pair.quote[currencyName].price
                            : pair.quote[currencyName].price_quote,
                    volume: pair.quote[currencyName].volume_24h,
                    score: String(pair.market_score),
                    updated: new Date(pair.quote[currencyName].last_updated),
                }))
                .sort((a, z) => {
                    if (a.market_reputation !== z.market_reputation) return z.market_reputation - a.market_reputation // reputation from high to low
                    if (a.price.toFixed(2) !== z.price.toFixed(2)) return z.price - a.price // price from high to low
                    return z.volume - a.volume // volume from high to low
                }),
        }
        const quotesInfo_ = quotesInfo?.[id]
        if (quotesInfo_)
            trending.market = {
                circulating_supply: quotesInfo_.total_supply ?? void 0,
                total_supply: quotesInfo_.total_supply ?? void 0,
                max_supply: quotesInfo_.max_supply ?? void 0,
                market_cap: quotesInfo_.quote[currencyName].market_cap,
                current_price: quotesInfo_.quote[currencyName].price,
                total_volume: quotesInfo_.quote[currencyName].volume_24h,
                price_change_percentage_1h: quotesInfo_.quote[currencyName].percent_change_1h,
                price_change_percentage_24h: quotesInfo_.quote[currencyName].percent_change_24h,
                price_change_percentage_1h_in_currency: quotesInfo_.quote[currencyName].percent_change_1h,
                price_change_percentage_24h_in_currency: quotesInfo_.quote[currencyName].percent_change_24h,
                price_change_percentage_7d_in_currency: quotesInfo_.quote[currencyName].percent_change_7d,
            }
        return trending
    }

    async getCoinPriceStats(
        chainId: ChainId,
        coinId: string,
        currency: TrendingAPI.Currency,
        days: number,
    ): Promise<TrendingAPI.Stat[]> {
        const interval = (() => {
            if (days === 0) return '1d' // max
            if (days > 365) return '1d' // 1y
            if (days > 90) return '2h' // 3m
            if (days > 30) return '1h' // 1m
            if (days > 7) return '15m' // 1w
            return '5m'
        })()
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        const stats = await this.getHistorical(
            coinId,
            currency.name.toUpperCase(),
            days === TrendingAPI.Days.MAX ? BTC_FIRST_LEGER_DATE : startDate,
            endDate,
            interval,
        )
        if (stats.is_active === 0) return []
        return Object.entries(stats).map(([date, x]) => [date, x[currency.name.toUpperCase()][0]])
    }
    getCoinMarketInfo(tokenSymbol: string): Promise<TrendingAPI.MarketInfo> {
        throw new Error('To be implemented.')
    }
}
