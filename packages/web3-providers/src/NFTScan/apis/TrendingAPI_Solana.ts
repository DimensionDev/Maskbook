import urlcat from 'urlcat'
import { compact } from 'lodash-es'
import { NonFungibleCollectionOverview, SourceType, TokenType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-solana'
import type { Response } from '../types/index.js'
import { resolveNFTScanHostName } from '../helpers/utils.js'
import { fetchFromNFTScanV2 } from '../helpers/Solana.js'
import type { NonFungibleTokenAPI, TrendingAPI } from '../../entry-types.js'

export class NFTScanTrendingAPI_Solana implements TrendingAPI.Provider<ChainId> {
    private async getCollection(chainId: ChainId, id: string): Promise<NonFungibleTokenAPI.Collection | undefined> {
        const path = urlcat('/api/sol/collections/:collection', {
            collection: id,
        })
        const response = await fetchFromNFTScanV2<Response<NonFungibleTokenAPI.Collection>>(chainId, path)
        return response?.data
    }

    async getCollectionOverview(chainId: ChainId, id: string): Promise<NonFungibleCollectionOverview | undefined> {
        const path = urlcat('/api/sol/statistics/ranking/trade', {})
        const response = await fetchFromNFTScanV2<Response<NonFungibleCollectionOverview[]>>(chainId, path)
        if (!response?.data) return
        return response.data.find((x) => x.collection === id)
    }

    async getCoinActivities(
        chainId: ChainId,
        id: string,
        cursor: string,
    ): Promise<{ content: Web3Helper.NonFungibleTokenActivityAll[]; cursor: string } | undefined> {
        const path = urlcat('/api/sol/transactions/collection/:collection', {
            collection: id,
            cursor,
            limit: 50,
        })

        const response = await fetchFromNFTScanV2<
            Response<{
                content: Web3Helper.NonFungibleTokenActivityAll[]
                next: string
            }>
        >(chainId, path)

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
        throw new Error('Method not implemented.')
    }

    async getCoinTrending(
        chainId: ChainId,
        /** address as id */ id: string,
        currency: TrendingAPI.Currency,
    ): Promise<TrendingAPI.Trending> {
        const collection = await this.getCollection(chainId, id)
        if (!collection) throw new Error(`NFTSCAN: Can not find token by id ${id}`)
        const address = collection.contract_address
        return {
            lastUpdated: new Date().toJSON(),
            dataProvider: SourceType.NFTScan,
            contracts: [{ chainId, address }],
            currency,
            coin: {
                id,
                name: collection.name,
                symbol: '',
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
            tickers: [],
        }
    }

    getCoinMarketInfo(symbol: string): Promise<TrendingAPI.MarketInfo> {
        throw new Error('Method not implemented.')
    }
}
