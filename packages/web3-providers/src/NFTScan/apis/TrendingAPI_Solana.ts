import urlcat from 'urlcat'
import { compact } from 'lodash-es'
import { TokenType, SourceType, NonFungibleCollectionOverview } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { EVM, Response } from '../types/index.js'
import { fetchFromNFTScanV2, getContractSymbol } from '../helpers/EVM.js'
import { resolveNFTScanHostName, resolveNFTScanRange, NonFungibleMarketplace } from '../helpers/utils.js'
import { LooksRareAPI } from '../../LooksRare/index.js'
import { OpenSeaAPI } from '../../OpenSea/index.js'
import { LooksRareLogo, OpenSeaLogo } from '../../Resources/index.js'
import type { TrendingAPI, NonFungibleTokenAPI } from '../../entry-types.js'

export class NFTScanTrendingAPI_Solana implements TrendingAPI.Provider<ChainId> {
    private looksrare = new LooksRareAPI()
    private opensea = new OpenSeaAPI()

    private async getCollection(
        chainId: Web3Helper.ChainIdAll,
        id: string,
    ): Promise<NonFungibleTokenAPI.Collection | undefined> {
        const path = urlcat('/api/sol/collections/:collection', {
            collection: id,
        })

        const response = await fetchFromNFTScanV2<Response<NonFungibleTokenAPI.Collection>>(
            chainId,
            path,
            undefined,
            NetworkPluginID.PLUGIN_SOLANA,
        )
        return response?.data
    }

    async getCollectionOverview(
        chainId: Web3Helper.ChainIdAll,
        id: string,
    ): Promise<NonFungibleCollectionOverview | undefined> {
        const path = urlcat('/api/sol/statistics/ranking/trade', {})
        const response = await fetchFromNFTScanV2<Response<NonFungibleCollectionOverview[]>>(
            chainId,
            path,
            undefined,
            NetworkPluginID.PLUGIN_SOLANA,
        )
        if (!response?.data) return
        return response.data.find((x) => x.collection === id)
    }

    async getCoinActivities(
        chainId: Web3Helper.ChainIdAll,
        id: string,
        cursor: string,
    ): Promise<{ content: Web3Helper.NonFungibleTokenActivity[]; cursor: string } | undefined> {
        const path = urlcat('/api/sol/transactions/collection/:collection', {
            collection: id,
            cursor,
            limit: 50,
        })

        const response = await fetchFromNFTScanV2<
            Response<{
                content: Web3Helper.NonFungibleTokenActivity[]
                next: string
            }>
        >(chainId, path, undefined, NetworkPluginID.PLUGIN_SOLANA)

        if (!response?.data?.content) return

        return {
            cursor: response.data.next,
            content: response.data.content.map((x) => {
                return {
                    ...x,
                    nftscan_uri: '',
                    transaction_link: `${resolveNFTScanHostName(NetworkPluginID.PLUGIN_SOLANA, chainId)}/${x.hash}`,
                }
            }),
        }
    }

    private async getCollectionTrending(
        chainId: ChainId,
        address: string,
        range: EVM.CollectionTrendingRange,
    ): Promise<EVM.CollectionTrendingRecord[]> {
        return EMPTY_LIST
    }

    getAllCoins(): Promise<TrendingAPI.Coin[]> {
        throw new Error('To be implemented.')
    }

    async getCoinsByKeyword(chainId: ChainId, keyword: string): Promise<TrendingAPI.Coin[]> {
        throw new Error('To be implemented.')
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
        chainId: Web3Helper.ChainIdAll,
        /** address as id */ id: string,
        currency: TrendingAPI.Currency,
    ): Promise<TrendingAPI.Trending> {
        const collection = await this.getCollection(chainId, id)
        if (!collection) {
            throw new Error(`NFTSCAN: Can not find token by id ${id}`)
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
                    collection.website
                        ? collection.website
                        : `${resolveNFTScanHostName(NetworkPluginID.PLUGIN_SOLANA, chainId)}/${address}`,
                ]),
                nftscan_url: `${resolveNFTScanHostName(NetworkPluginID.PLUGIN_SOLANA, chainId)}/${address}`,
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
                price_symbol: collection.price_symbol || 'SOL',
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
