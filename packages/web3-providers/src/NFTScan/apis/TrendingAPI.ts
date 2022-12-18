import urlcat from 'urlcat'
import { compact } from 'lodash-es'
import {
    TokenType,
    SourceType,
    NonFungibleCollectionOverview,
    NonFungibleTokenActivity,
} from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { createLookupTableResolver, EMPTY_LIST } from '@masknet/shared-base'
import { ChainId, isValidChainId } from '@masknet/web3-shared-evm'
import { COIN_RECOMMENDATION_SIZE } from '../../Trending/constants.js'
import type { EVM, Response } from '../types/index.js'
import {
    fetchFromNFTScanV2,
    postNFTScanRestFulAPI,
    fetchFromNFTScanRestFulAPI,
    getContractSymbol,
    fetchFromNFTScanWebAPI,
    resolveNFTScanHostName,
    NFTScanChainId,
} from '../helpers/EVM.js'
import { LooksRareAPI } from '../../LooksRare/index.js'
import { OpenSeaAPI } from '../../OpenSea/index.js'
import { LooksRareLogo, OpenSeaLogo } from '../../Resources/index.js'
import { TrendingAPI, NonFungibleTokenAPI } from '../../entry-types.js'

enum NonFungibleMarketplace {
    OpenSea = 'OpenSea',
    LooksRare = 'LooksRare',
}

const resolveNFTScanRange = createLookupTableResolver<TrendingAPI.Days, EVM.CollectionTrendingRange>(
    {
        [TrendingAPI.Days.MAX]: 'all',
        [TrendingAPI.Days.ONE_DAY]: '1d',
        [TrendingAPI.Days.ONE_WEEK]: '7d',
        [TrendingAPI.Days.ONE_MONTH]: '30d',
        [TrendingAPI.Days.THREE_MONTHS]: '90d',
        [TrendingAPI.Days.ONE_YEAR]: '1y',
    },
    // NFTScan will discard range unrecognized range
    () => '1d',
)

export class NFTScanTrendingAPI implements TrendingAPI.Provider<ChainId> {
    private looksrare = new LooksRareAPI()
    private opensea = new OpenSeaAPI()

    private async getCollection(
        chainId: ChainId,
        address: string,
    ): Promise<NonFungibleTokenAPI.Collection | undefined> {
        if (!isValidChainId(chainId)) return
        const path = urlcat('/api/v2/collections/:address', {
            address,
            contract_address: address,
        })
        const response = await fetchFromNFTScanV2<Response<NonFungibleTokenAPI.Collection>>(chainId, path)
        return response?.data
    }

    private async searchNFTCollection(chainId: ChainId, keyword: string): Promise<NonFungibleTokenAPI.Collection[]> {
        if (!isValidChainId(chainId)) return EMPTY_LIST
        const path = '/api/v2/collections/filters'
        const response = await fetchFromNFTScanV2<Response<NonFungibleTokenAPI.Collection[]>>(chainId, path, {
            method: 'POST',
            body: JSON.stringify({
                name: keyword,
                symbol: keyword,
                sort_direction: 'desc',
                sort_field: 'floor_price',
                name_fuzzy_search: true,
            }),
        })
        return response?.data ?? EMPTY_LIST
    }

    async getCollectionByTwitterHandler(twitterHandler: string): Promise<NonFungibleTokenAPI.Collection | undefined> {
        const path = '/api/v2/collections/filters'
        const response = await postNFTScanRestFulAPI<Response<NonFungibleTokenAPI.Collection[]>>(
            path,
            JSON.stringify({ twitter: twitterHandler }),
        )
        return response?.data[0]
    }

    async getCollectionOverview(
        chainId: Web3Helper.ChainIdAll,
        address: string,
    ): Promise<NonFungibleCollectionOverview | undefined> {
        const path = urlcat('/api/v2/statistics/collection/:address', {
            address,
        })
        const response = await fetchFromNFTScanRestFulAPI<Response<NonFungibleCollectionOverview>>(path)
        if (!response?.data) return
        return response.data
    }

    async getCoinActivities(
        chainId: Web3Helper.ChainIdAll,
        contractAddress: string,
        pageIndex: number,
    ): Promise<NonFungibleTokenActivity[] | undefined> {
        if (!isValidChainId(chainId as NFTScanChainId)) return
        const path = urlcat('/nftscan/getTransactionByNftContract', {
            contract: contractAddress,
            filterType: 'all',
            pageIndex,
            pageSize: 20,
        })
        const response = await fetchFromNFTScanWebAPI<
            Response<{ nft_tx_record: NonFungibleTokenActivity[]; nft_tx_total: number }>
        >(chainId as NFTScanChainId, path)
        if (!response?.data.nft_tx_record) return
        return response.data.nft_tx_record.map((x) => ({
            ...x,
            transactionLink: `${resolveNFTScanHostName(chainId as NFTScanChainId)}/${x.transaction_hash}`,
        }))
    }

    private async getCollectionTrending(
        chainId: ChainId,
        address: string,
        range: EVM.CollectionTrendingRange,
    ): Promise<EVM.CollectionTrendingRecord[]> {
        const path = urlcat('/api/v2/statistics/collection/trending/:address', {
            address,
            time: range,
        })
        const response = await fetchFromNFTScanV2<Response<EVM.CollectionTrendingRecord[]>>(chainId, path)
        return response?.data ?? EMPTY_LIST
    }

    getAllCoins(): Promise<TrendingAPI.Coin[]> {
        return Promise.resolve(EMPTY_LIST)
    }

    async getCoinsByKeyword(chainId: ChainId, keyword: string): Promise<TrendingAPI.Coin[]> {
        if (!keyword || !isValidChainId(chainId)) return EMPTY_LIST
        const nfts = await this.searchNFTCollection(chainId, keyword)

        const coins: TrendingAPI.Coin[] = nfts.map((nft) => ({
            id: nft.contract_address,
            name: nft.name,
            symbol: nft.symbol,
            type: TokenType.NonFungible,
            address: nft.contract_address,
            contract_address: nft.contract_address,
            image_url: nft.logo_url,
        }))
        return coins.slice(0, COIN_RECOMMENDATION_SIZE)
    }

    getCoinInfoByAddress(address: string): Promise<TrendingAPI.CoinInfo | undefined> {
        throw new Error('To be implemented.')
    }

    async getCoinPriceStats(
        chainId: ChainId,
        coinId: string,
        currency: TrendingAPI.Currency,
        days: number,
    ): Promise<TrendingAPI.Stat[]> {
        const range = resolveNFTScanRange(days)
        const records = await this.getCollectionTrending(chainId, coinId, range)
        return records.map((x) => [x.begin_timestamp, x.average_price])
    }

    async getCoinTrending(
        chainId: ChainId,
        /** address as id */ id: string,
        currency: TrendingAPI.Currency,
    ): Promise<TrendingAPI.Trending> {
        const collection = await this.getCollection(chainId, id)

        if (!collection) {
            throw new Error(`NFTSCAN: Can not find token by address ${id}`)
        }
        const address = collection.contract_address
        const [symbol, openseaStats, looksrareStats] = await Promise.all([
            getContractSymbol(id, chainId),
            this.opensea.getStats(address).catch(() => null),
            this.looksrare.getStats(address).catch(() => null),
        ])
        const tickers: TrendingAPI.Ticker[] = compact([
            openseaStats
                ? {
                      logo_url: OpenSeaLogo,
                      // TODO
                      trade_url: `https://opensea.io/assets/ethereum/${address}`,
                      market_name: NonFungibleMarketplace.OpenSea,
                      volume_24h: openseaStats.volume24h,
                      floor_price: openseaStats.floorPrice,
                      price_symbol: collection.price_symbol,
                      sales_24: openseaStats.count24h,
                  }
                : null,
            looksrareStats
                ? {
                      logo_url: LooksRareLogo,
                      trade_url: `https://looksrare.org/collections/${address}`,
                      market_name: NonFungibleMarketplace.LooksRare,
                      volume_24h: looksrareStats.volume24h,
                      floor_price: looksrareStats.floorPrice,
                      price_symbol: collection.price_symbol,
                      sales_24: looksrareStats.count24h,
                  }
                : null,
        ])
        return {
            lastUpdated: new Date().toJSON(),
            dataProvider: SourceType.NFTScan,
            contracts: [{ chainId, address }],
            currency,
            coin: {
                id,
                name: collection.name,
                symbol,
                address,
                contract_address: address,
                type: TokenType.NonFungible,
                description: collection.description,
                image_url: collection.logo_url,
                home_urls: compact([
                    `${resolveNFTScanHostName(chainId as NFTScanChainId)}/${address}`,
                    collection.website,
                ]),
                community_urls: [
                    {
                        type: 'twitter',
                        link:
                            collection.twitter &&
                            (collection.twitter.startsWith('https://twitter.com/')
                                ? collection.twitter
                                : `https://twitter.com/${collection.twitter}`),
                    },
                    {
                        type: 'facebook',
                        // TODO format of facebook url is unknown
                        link: null,
                    },
                    {
                        type: 'discord',
                        link: collection.discord,
                    },
                    {
                        type: 'instagram',
                        link:
                            collection.instagram &&
                            (collection.instagram.startsWith('https://instagram.com/')
                                ? collection.instagram
                                : `https://www.instagram.com/${collection.instagram}`),
                    },
                    {
                        type: 'medium',
                        link:
                            collection.medium &&
                            (collection.medium.startsWith('https://instagram.com/@')
                                ? collection.medium
                                : `https://medium.com/@${collection.medium}`),
                    },
                    {
                        type: 'reddit',
                        link: collection.reddit,
                    },
                    {
                        type: 'telegram',
                        link: collection.telegram,
                    },
                    {
                        type: 'youtube',
                        link: collection.youtube,
                    },
                    {
                        type: 'github',
                        link: collection.github,
                    },
                ].filter((x) => x.link) as TrendingAPI.CommunityUrls,
            },
            market: {
                total_supply: collection.items_total,
                current_price: collection.floor_price,
                floor_price: collection.floor_price,
                highest_price: undefined,
                owners_count: collection.owners_total,
                price_symbol: collection.price_symbol,
                royalty: collection.royalty?.toString(),
                total_24h: undefined,
                volume_24h: undefined,
                average_volume_24h: undefined,
                volume_all: undefined,
            },
            tickers,
        }
    }
    getCoinMarketInfo(symbol: string): Promise<TrendingAPI.MarketInfo> {
        throw new Error('Method not implemented.')
    }
}
