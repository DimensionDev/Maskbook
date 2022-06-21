import getUnixTime from 'date-fns/getUnixTime'
import type { TrendingAPI } from '../types'
import type { ChainId } from '@masknet/web3-shared-evm'
import { BTC_FIRST_LEGER_DATE, CMC_V1_BASE_URL, THIRD_PARTY_V1_BASE_URL } from './constants'
import { getCommunityLink, isMirroredKeyword, resolveChainIdByName } from './helper'
import { DataProvider } from '@masknet/public-api'
import type { Coin, ResultData, Status } from './type'
import { fetchJSON, getTraderAllAPICachedFlag } from '../helpers'

export enum Days {
    MAX = 0,
    ONE_DAY = 1,
    ONE_WEEK = 7,
    ONE_MONTH = 30,
    ONE_YEAR = 365,
}

// #regin get quote info
export interface QuotesInfo {
    circulating_supply: number
    cmc_rank: number
    date_added: string
    id: number
    is_active: boolean
    is_fiat: 0 | 1
    last_updated: string
    max_supply: null | number
    name: string
    num_market_pairs: number
    quote: Record<
        string,
        {
            last_updated: string
            market_cap?: number
            percent_change_1h?: number
            percent_change_7d?: number
            percent_change_24h?: number
            price: number
            volume_24h?: number
        }
    >
    slug: string
    symbol: string
    tags: string[]
    total_supply: number
}

export async function getQuotesInfo(id: string, currency: string) {
    const params = new URLSearchParams()
    params.append('id', id)
    params.append('convert', currency)

    try {
        const response = await fetch(`${THIRD_PARTY_V1_BASE_URL}/cryptocurrency/widget?${params.toString()}`, {
            cache: getTraderAllAPICachedFlag(),
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
export interface PlatformInfo {
    coin: {
        id: string
        name: string
        slug: string
        symbol: string
    }
    name: string
}

export interface ContractInfo {
    contract_address: string
    platform: PlatformInfo
}
export interface CoinInfo {
    category: string
    contract_address: ContractInfo[]
    date_added: string
    date_launched: string | null
    description: string
    id: number
    is_hidden: 0 | 1
    logo: string
    name: string
    notice: string
    platform?: {
        id: number
        name: string
        slug: string
        symbol: string
        token_address: string
    }
    slug: string
    status: string
    subreddit: string
    symbol: string
    'tag-groups': string[]
    'tag-names': string[]
    tags: string[]
    twitter_username: string
    urls: {
        announcement?: string[]
        chat?: string[]
        explorer?: string[]
        reddit?: string[]
        source_code?: string[]
        message_board?: string[]
        technical_doc?: string[]
        twitter?: string[]
        website?: string[]
    }
}

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
export interface Pair {
    exchange: {
        id: number
        name: string
        slug: string
    }
    market_id: number
    market_pair: string
    market_pair_base: {
        currency_id: number
        currency_symbol: string
        currency_type: string
        exchange_symbol: string
    }
    market_pair_quote: {
        currency_id: number
        currency_symbol: string
        currency_type: string
        exchange_symbol: string
    }
    market_reputation: number
    market_score: number
    market_url: string
    outlier_detected: 0 | 1
    quote: Record<
        string,
        {
            effective_liquidity: 0 | 1
            last_updated: string
            price: number
            price_quote: number
            volume_24h: number
        }
    > & {
        exchange_reported: {
            last_updated: string
            price: number
            volume_24h_base: number
            volume_24h_quote: number
        }
    }
}
export async function getLatestMarketPairs(id: string, currency: string) {
    const params = new URLSearchParams(
        'aux=num_market_pairs,market_url,price_quote,effective_liquidity,market_score,market_reputation&limit=40&sort=cmc_rank&start=1',
    )
    params.append('convert', currency)
    params.append('id', id)

    try {
        const response = await fetch(`${CMC_V1_BASE_URL}/cryptocurrency/market-pairs/latest?${params.toString()}`, {
            cache: getTraderAllAPICachedFlag(),
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
    async getCoins(): Promise<TrendingAPI.Coin[]> {
        const response = await fetchJSON<ResultData<Coin[]>>(
            `${CMC_V1_BASE_URL}/cryptocurrency/map?aux=status,platform&listing_status=active,untracked&sort=cmc_rank`,
            { cache: 'force-cache' },
        )
        return (response.data ?? [])
            .filter((x) => x.status === 'active')
            .map(
                (x) =>
                    ({
                        id: String(x.id),
                        name: x.name,
                        symbol: x.symbol,
                        contract_address: x.platform?.name === 'Ethereum' ? x.platform.token_address : undefined,
                    } as TrendingAPI.Coin),
            )
    }
    async getHistorical(
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
            cache: getTraderAllAPICachedFlag(),
        })

        return response.data
    }
    getCurrencies(): Promise<TrendingAPI.Currency[]> {
        return Promise.resolve([])
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
                    chainId: resolveChainIdByName(x.platform.name, coinInfo.symbol),
                    address: x.contract_address,
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
                image_url: `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`,
                platform_url: `https://coinmarketcap.com/currencies/${coinInfo.slug}/`,
                twitter_url: coinInfo.urls.twitter?.find((x) => x.includes('twitter')),
                telegram_url: coinInfo.urls.chat?.find((x) => x.includes('telegram')),
                market_cap_rank: quotesInfo?.[id]?.cmc_rank,
                description: coinInfo.description,
                contract_address: contracts.find((x) => x.chainId === chainId)?.address,
            },
            currency,
            dataProvider: DataProvider.COIN_MARKET_CAP,
            tickers: market.market_pairs
                .map((pair) => ({
                    logo_url: `https://s2.coinmarketcap.com/static/img/exchanges/32x32/${pair.exchange.id}.png`,
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

    async getPriceStats(
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
            days === Days.MAX ? BTC_FIRST_LEGER_DATE : startDate,
            endDate,
            interval,
        )
        if (stats.is_active === 0) return []
        return Object.entries(stats).map(([date, x]) => [date, x[currency.name.toUpperCase()][0]])
    }
}
