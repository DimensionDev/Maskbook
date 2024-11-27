import urlcat from 'urlcat'
import { compact } from 'lodash-es'
import { MaskIconURLs } from '@masknet/icons'
import {
    TokenType,
    SourceType,
    type NonFungibleCollectionOverview,
    type NonFungibleTokenActivity,
} from '@masknet/web3-shared-base'
import { EMPTY_LIST, isDomainOrSubdomainOf, NetworkPluginID, twitterDomainMigrate } from '@masknet/shared-base'
import { type ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import type { EVM, Response } from '../types/index.js'
import { fetchFromNFTScanV2, createNonFungibleAsset } from '../helpers/EVM.js'
import { getContractSymbol } from '../../helpers/getContractSymbol.js'
import { resolveNFTScanHostName, resolveNFTScanRange, NonFungibleMarketplace } from '../helpers/utils.js'
import { LooksRare } from '../../LooksRare/index.js'
import { OpenSea } from '../../OpenSea/index.js'
import { getPaymentToken } from '../../helpers/getPaymentToken.js'
import type { TrendingAPI, NonFungibleTokenAPI } from '../../entry-types.js'

class NFTScanTrendingAPI_EVM implements TrendingAPI.Provider<ChainId> {
    private async getCollection(chainId: ChainId, id: string): Promise<NonFungibleTokenAPI.Collection | undefined> {
        const path = urlcat('/api/v2/collections/:address', {
            address: id,
            contract_address: id,
        })
        const response = await fetchFromNFTScanV2<Response<NonFungibleTokenAPI.Collection>>(chainId, path)
        return response?.data
    }

    async getCollectionOverview(chainId: ChainId, id: string): Promise<NonFungibleCollectionOverview | undefined> {
        const path = urlcat('/api/v2/statistics/collection/:address', {
            address: id,
        })
        const response = await fetchFromNFTScanV2<Response<NonFungibleCollectionOverview>>(chainId, path)
        if (!response?.data) return
        return response.data
    }

    async getAssetsBatch(chainId: ChainId, list: Array<{ contract_address: string; token_id: string }>) {
        const path = urlcat('/api/v2/assets/batch', {})
        const response = await fetchFromNFTScanV2<Response<EVM.Asset[]>>(chainId, path, {
            method: 'POST',
            body: JSON.stringify({
                contract_address_with_token_id_list: list,
            }),
        })
        if (!response?.data) return
        return response.data.map((x) => createNonFungibleAsset(chainId, x))
    }

    async getCoinActivities(
        chainId: ChainId,
        id: string,
        cursor: string,
    ): Promise<{ content: Array<NonFungibleTokenActivity<ChainId, SchemaType>>; cursor: string } | undefined> {
        const path = urlcat('/api/v2/transactions/:contract', {
            contract: id,
            cursor,
            limit: 50,
        })
        const response = await fetchFromNFTScanV2<
            Response<{
                content: Array<NonFungibleTokenActivity<ChainId, SchemaType>>
                next: string
            }>
        >(chainId, path)

        if (!response?.data?.content) return

        const batchQueryList = response?.data?.content.map((x) => ({
            contract_address: x.contract_address,
            token_id: x.token_id ?? '',
        }))

        const assetsBatchResponse = await this.getAssetsBatch(chainId, batchQueryList)

        return {
            cursor: response.data.next,
            content: response.data.content.map((x) => {
                const asset = assetsBatchResponse?.find((y) => y.tokenId === x.token_id)
                return {
                    ...x,
                    imageURL: asset?.metadata?.imageURL ?? '',
                    transaction_link: `${resolveNFTScanHostName(NetworkPluginID.PLUGIN_EVM, chainId)}/${x.hash}`,
                    trade_token: getPaymentToken(chainId, { symbol: x.trade_symbol }),
                }
            }),
        }
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

    async getCoinPriceStats(chainId: ChainId, coinId: string, days: number): Promise<TrendingAPI.Stat[]> {
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
            throw new Error(`NFTSCAN: Can not find token by id ${id}`)
        }
        const address = collection.contract_address
        const [symbol, openseaStats, looksrareStats] = await Promise.all([
            getContractSymbol(chainId, id),
            OpenSea.getStats(address).catch(() => null),
            LooksRare.getStats(address).catch(() => null),
        ])
        const tickers: TrendingAPI.Ticker[] = compact([
            openseaStats ?
                {
                    logo_url: MaskIconURLs.open_sea_url(),
                    // TODO
                    trade_url: `https://opensea.io/assets/ethereum/${address}`,
                    market_name: NonFungibleMarketplace.OpenSea,
                    volume_24h: openseaStats.volume24h,
                    floor_price: openseaStats.floorPrice,
                    price_symbol: collection.price_symbol,
                    sales_24: openseaStats.count24h,
                }
            :   null,
            looksrareStats ?
                {
                    logo_url: MaskIconURLs.looks_rare_url(),
                    trade_url: `https://looksrare.org/collections/${address}`,
                    market_name: NonFungibleMarketplace.LooksRare,
                    volume_24h: looksrareStats.volume24h,
                    floor_price: looksrareStats.floorPrice,
                    price_symbol: collection.price_symbol,
                    sales_24: looksrareStats.count24h,
                }
            :   null,
        ])

        return {
            lastUpdated: new Date().toJSON(),
            dataProvider: SourceType.NFTScan,
            contracts: [{ chainId, address, pluginID: NetworkPluginID.PLUGIN_EVM }],
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
                    collection.website ?
                        collection.website
                    :   `${resolveNFTScanHostName(NetworkPluginID.PLUGIN_EVM, chainId)}/${address}`,
                ]),
                nftscan_url: `${resolveNFTScanHostName(NetworkPluginID.PLUGIN_EVM, chainId)}/${address}`,
                community_urls: [
                    {
                        type: 'twitter',
                        link:
                            collection.twitter &&
                            ((
                                isDomainOrSubdomainOf(collection.twitter, 'twitter.com') ||
                                isDomainOrSubdomainOf(collection.twitter, 'x.com')
                            ) ?
                                collection.twitter
                            :   twitterDomainMigrate(`https://x.com/${collection.twitter}`)),
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
                            (collection.instagram.startsWith('https://instagram.com/') ?
                                collection.instagram
                            :   `https://www.instagram.com/${collection.instagram}`),
                    },
                    {
                        type: 'medium',
                        link:
                            collection.medium &&
                            (collection.medium.startsWith('https://instagram.com/@') ?
                                collection.medium
                            :   `https://medium.com/@${collection.medium}`),
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
                current_price:
                    collection.floor_price ?
                        collection.floor_price.toString()
                    :   (openseaStats?.floorPrice.toString() ?? ''),
                floor_price: collection.floor_price?.toString(),
                owners_count: collection.owners_total,
                price_symbol: collection.price_symbol || 'ETH',
                royalty: collection.royalty?.toString(),
            },
            tickers,
        }
    }
}
export const NFTScanTrending_EVM = new NFTScanTrendingAPI_EVM()
