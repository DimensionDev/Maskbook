import urlcat from 'urlcat'
import { compact } from 'lodash-es'
import { MaskIconURLs } from '@masknet/icons'
import {
    EMPTY_LIST,
    createPageable,
    type Pageable,
    type PageIndicator,
    createIndicator,
    createNextIndicator,
    NetworkPluginID,
} from '@masknet/shared-base'
import {
    SourceType,
    type NonFungibleAsset,
    type NonFungibleCollection,
    TokenType,
    leftShift,
    type NonFungibleCollectionOverview,
} from '@masknet/web3-shared-base'
import { formatBalance } from '@masknet/web3-shared-base'
import subSeconds from 'date-fns/subSeconds'
import isAfter from 'date-fns/isAfter'
import secondsToMilliseconds from 'date-fns/secondsToMilliseconds'
import millisecondsToSeconds from 'date-fns/millisecondsToSeconds'
import { ChainId, type SchemaType, isValidChainId } from '@masknet/web3-shared-evm'
import {
    fetchFromSimpleHash,
    createNonFungibleAsset,
    resolveChain,
    createNonFungibleCollection,
    resolveChainId,
    getAllChainNames,
    resolveSimpleHashRange,
    SIMPLE_HASH_HISTORICAL_PRICE_START_TIME,
} from '../helpers.js'
import { type Asset, type Collection, type PaymentToken, type PriceStat, type CollectionOverview } from '../type.js'
import { LooksRareAPI } from '../../LooksRare/index.js'
import { OpenSeaAPI } from '../../OpenSea/index.js'
import { getContractSymbol } from '../../helpers/getContractSymbol.js'
import { NonFungibleMarketplace } from '../../NFTScan/helpers/utils.js'
import type { HubOptions_Base, NonFungibleTokenAPI, TrendingAPI } from '../../entry-types.js'
import { historicalPriceState } from '../historicalPriceState.js'

export class SimpleHashAPI_EVM implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    private looksrare = new LooksRareAPI()
    private opensea = new OpenSeaAPI()

    private async getCollectionByContractAddress(
        address: string,
        { chainId = ChainId.Mainnet }: HubOptions_Base<ChainId> = {},
    ): Promise<Collection | undefined> {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!chain || !address || !isValidChainId(chainId)) return
        const path = urlcat('/api/v0/nfts/collections/:chain/:address', {
            chain,
            address,
        })

        const { collections } = await fetchFromSimpleHash<{ collections: Collection[] }>(path)

        return collections[0]
    }

    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions_Base<ChainId> = {}) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!chain || !address || !tokenId || !isValidChainId(chainId)) return
        const path = urlcat('/api/v0/nfts/:chain/:address/:tokenId', {
            chain,
            address,
            tokenId,
        })
        const response = await fetchFromSimpleHash<Asset>(path)
        return createNonFungibleAsset(response)
    }

    async getCollectionOverview(chainId: ChainId, id: string): Promise<NonFungibleCollectionOverview | undefined> {
        const path = urlcat('/api/v0/nfts/collections_activity', {
            collection_ids: id,
        })

        const response = await fetchFromSimpleHash<{ collections: CollectionOverview[] }>(path)
        const overview = response.collections[0]

        const floorPricePath = urlcat('/api/v0/nfts/floor_prices/collection/:id/opensea', {
            id,
        })

        const floorPriceResponse = await fetchFromSimpleHash<{ '1_day_average': number }>(floorPricePath)

        return {
            collection: overview.name,
            market_cap: formatBalance(overview.market_cap, overview.payment_token.decimals),
            average_price_change_1d: overview['1_day_volume_change_percent'] + '%',
            volume_24h: formatBalance(overview['1_day_volume'], overview.payment_token.decimals),
            average_price_24h: formatBalance(floorPriceResponse['1_day_average'], overview.payment_token.decimals),
            total_volume: formatBalance(overview.all_time_volume, overview.payment_token.decimals),
        }
    }

    async getAssets(account: string, { chainId = ChainId.Mainnet, indicator }: HubOptions_Base<ChainId> = {}) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!account || !isValidChainId(chainId) || !chain) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }
        const path = urlcat('/api/v0/nfts/owners', {
            chains: chain,
            wallet_addresses: account,
            contract_addresses: '',
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        })

        const response = await fetchFromSimpleHash<{ next_cursor: string; nfts: Asset[] }>(path)
        const assets = response.nfts.map((x) => createNonFungibleAsset(x)).filter(Boolean) as Array<
            NonFungibleAsset<ChainId, SchemaType>
        >

        return createPageable(
            assets,
            indicator,
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        )
    }

    async getAssetsByCollection(
        address: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions_Base<ChainId> = {},
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!chain || !address || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }

        const path = urlcat(`/api/v0/nfts/${chain}/:address`, {
            address,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        })

        const response = await fetchFromSimpleHash<{ next_cursor: string; nfts: Asset[] }>(path)

        const assets = response.nfts.map((x) => createNonFungibleAsset(x)).filter(Boolean) as Array<
            NonFungibleAsset<ChainId, SchemaType>
        >

        return createPageable(
            assets,
            createIndicator(indicator),
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        )
    }

    async getCoinPriceStats(
        chainId: ChainId,
        collectionId: string,
        currency: TrendingAPI.Currency,
        days: TrendingAPI.Days,
    ): Promise<TrendingAPI.Stat[]> {
        const range = resolveSimpleHashRange(days)
        const to_timeStamp = millisecondsToSeconds(Date.now())
        const isLoadAll = !range
        const from_timeStamp = isLoadAll ? SIMPLE_HASH_HISTORICAL_PRICE_START_TIME : to_timeStamp - range
        let cursor = '' as string | null
        while (cursor !== null && !historicalPriceState.isLoaded(collectionId, secondsToMilliseconds(from_timeStamp))) {
            const path = urlcat('/api/v0/nfts/floor_prices/collection/:collectionId/opensea', {
                collectionId,
                to_timeStamp,
                from_timeStamp,
                cursor: cursor ? cursor : undefined,
            })

            const response = await fetchFromSimpleHash<{
                next_cursor: string
                floor_prices: PriceStat[]
                payment_token: PaymentToken
            }>(path)

            const firstFloorPriceTimeStamp = response.floor_prices?.[0]?.timestamp
            cursor =
                !firstFloorPriceTimeStamp ||
                isAfter(secondsToMilliseconds(from_timeStamp), new Date(firstFloorPriceTimeStamp))
                    ? null
                    : response.next_cursor

            historicalPriceState.updatePriceState(collectionId, response.floor_prices, response.payment_token)
        }

        if (isLoadAll) historicalPriceState.updateAllLoadedIdListState(collectionId)

        return historicalPriceState.getPriceStats(
            collectionId,
            isLoadAll ? undefined : subSeconds(Date.now(), range).getTime(),
        )
    }

    async getHighestFloorPrice(collectionId: string) {
        let cursor = '' as string | null

        while (cursor !== null && !historicalPriceState.isLoaded(collectionId)) {
            const path = urlcat('/api/v0/nfts/floor_prices/collection/:collectionId/opensea', {
                collectionId,
                cursor: cursor ? cursor : undefined,
            })

            const response = await fetchFromSimpleHash<{
                next_cursor: string
                floor_prices: PriceStat[]
                payment_token: PaymentToken
            }>(path)

            cursor = response.next_cursor
            historicalPriceState.updatePriceState(collectionId, response.floor_prices, response.payment_token)
        }

        historicalPriceState.updateAllLoadedIdListState(collectionId)

        return historicalPriceState.getHighestPrice(collectionId)
    }

    async getOneDaySaleAmounts(collectionId: string) {
        const to_timeStamp = millisecondsToSeconds(Date.now())
        const from_timeStamp = millisecondsToSeconds(subSeconds(Date.now(), 60 * 60 * 24).getTime())
        let sales: Array<{ timestamp: string }> = []
        let cursor = '' as string | null
        while (cursor !== null) {
            const path = urlcat('/api/v0/nfts/transfers/collection/:collectionId', {
                collectionId,
                only_sales: 1,
                to_timeStamp,
                from_timeStamp,
                cursor: cursor ? cursor : undefined,
            })

            const response = await fetchFromSimpleHash<{
                transfers: Array<{ timestamp: string }>
                next_cursor: string
            }>(path)

            const firstFloorPriceTimeStamp = response.transfers?.[0]?.timestamp

            cursor =
                !firstFloorPriceTimeStamp ||
                isAfter(secondsToMilliseconds(from_timeStamp), new Date(firstFloorPriceTimeStamp))
                    ? null
                    : response.next_cursor

            sales = sales.concat(response.transfers)
        }

        return sales.filter((x) => isAfter(new Date(x.timestamp), secondsToMilliseconds(from_timeStamp))).length
    }

    async getCollectionsByOwner(
        account: string,
        { chainId, indicator, allChains }: HubOptions_Base<ChainId> = {},
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>> {
        const pluginId = NetworkPluginID.PLUGIN_EVM
        const chain = allChains || !chainId ? getAllChainNames(pluginId) : resolveChain(pluginId, chainId)
        if (!chain || !account || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }

        const path = urlcat('/api/v0/nfts/collections_by_wallets', {
            chains: chain,
            wallet_addresses: account,
        })

        const response = await fetchFromSimpleHash<{ collections: Collection[] }>(path)

        const collections = response.collections
            // Might got bad data responded including id field and other fields empty
            .filter((x) => x?.id && isValidChainId(resolveChainId(x.chain)) && x.spam_score !== 100)
            .map((x) => createNonFungibleCollection(x))

        return createPageable(collections, createIndicator(indicator))
    }

    async getAssetsByCollectionAndOwner(
        collectionId: string,
        owner: string,
        { chainId = ChainId.Mainnet, indicator, size = 50 }: HubOptions_Base<ChainId> = {},
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!chain || !isValidChainId(chainId) || !collectionId || !owner)
            return createPageable(EMPTY_LIST, createIndicator(indicator))

        const path = urlcat('/api/v0/nfts/owners', {
            chains: chain,
            wallet_addresses: owner,
            collection_ids: collectionId,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
            limit: size,
        })

        const response = await fetchFromSimpleHash<{ nfts: Asset[]; next_cursor: string }>(path)

        const assets = response.nfts.map((x) => createNonFungibleAsset(x)).filter(Boolean) as Array<
            NonFungibleAsset<ChainId, SchemaType>
        >

        return createPageable(
            assets,
            createIndicator(indicator),
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        )
    }

    async getCollectionVerifiedBy(id: string) {
        const path = urlcat('/api/v0/nfts/collections/ids', {
            collection_ids: id,
        })
        const response = await fetchFromSimpleHash<{ collections: Collection[] }>(path)
        if (!response.collections.length) return []
        const marketplaces = response.collections[0].marketplace_pages?.filter((x) => x.verified) || []
        return marketplaces.map((x) => x.marketplace_name)
    }

    async getCoinTrending(
        chainId: ChainId,
        address: string,
        currency: TrendingAPI.Currency,
    ): Promise<TrendingAPI.Trending | undefined> {
        const collection = await this.getCollectionByContractAddress(address, { chainId })
        if (!collection) {
            throw new Error(`SimpleHash: Can not find collection by address ${address}, chainId ${chainId}`)
        }

        const [symbol, openseaStats, looksrareStats] = await Promise.all([
            getContractSymbol(chainId, address),
            this.opensea.getStats(address).catch(() => null),
            this.looksrare.getStats(address).catch(() => null),
        ])

        const paymentToken = collection.floor_prices[0]?.payment_token

        if (!paymentToken) return

        const tickers: TrendingAPI.Ticker[] = compact([
            openseaStats
                ? {
                      logo_url: MaskIconURLs.open_sea_url().toString(),
                      // TODO
                      trade_url: `https://opensea.io/assets/ethereum/${address}`,
                      market_name: NonFungibleMarketplace.OpenSea,
                      volume_24h: openseaStats.volume24h,
                      floor_price: openseaStats.floorPrice,
                      price_symbol: paymentToken?.symbol,
                      sales_24: openseaStats.count24h,
                  }
                : null,
            looksrareStats
                ? {
                      logo_url: MaskIconURLs.looks_rare_url().toString(),
                      trade_url: `https://looksrare.org/collections/${address}`,
                      market_name: NonFungibleMarketplace.LooksRare,
                      volume_24h: looksrareStats.volume24h,
                      floor_price: looksrareStats.floorPrice,
                      price_symbol: paymentToken?.symbol,
                      sales_24: looksrareStats.count24h,
                  }
                : null,
        ])

        return {
            lastUpdated: new Date().toJSON(),
            dataProvider: SourceType.SimpleHash,
            contracts: [{ chainId, address, pluginID: NetworkPluginID.PLUGIN_EVM }],
            currency: {
                id: paymentToken?.payment_token_id,
                symbol: paymentToken?.symbol,
                name: paymentToken?.symbol,
                chainId,
            },
            coin: {
                id: collection.collection_id,
                name: collection.name,
                symbol,
                address,
                contract_address: address,
                type: TokenType.NonFungible,
                description: collection.description,
                image_url: collection.image_url,
                home_urls: [collection.external_url],
                community_urls: [
                    {
                        type: 'twitter',
                        link: collection.twitter_username ? `https://twitter.com/${collection.twitter_username}` : null,
                    },
                    {
                        type: 'facebook',
                        // TODO format of facebook url is unknown
                        link: null,
                    },
                    {
                        type: 'discord',
                        link: collection.discord_url,
                    },
                    {
                        type: 'instagram',
                        link: collection.instagram_username
                            ? `https://www.instagram.com/${collection.instagram_username}`
                            : null,
                    },
                    {
                        type: 'medium',
                        link: collection.medium_username ? `https://medium.com/@${collection.medium_username}` : null,
                    },
                    {
                        type: 'reddit',
                        link: null,
                    },
                    {
                        type: 'telegram',
                        link: collection.telegram_url,
                    },
                    {
                        type: 'youtube',
                        link: null,
                    },
                    {
                        type: 'github',
                        link: null,
                    },
                ].filter((x) => x.link) as TrendingAPI.CommunityUrls,
            },
            market: {
                total_supply: collection.total_quantity,
                current_price: leftShift(collection.floor_prices[0]?.value, paymentToken?.decimals).toString(),
                floor_price: leftShift(collection.floor_prices[0]?.value, paymentToken?.decimals).toString(),
                owners_count: collection.distinct_owner_count,
                volume_24h: tickers?.[0]?.volume_24h,
                total_24h: tickers?.[0]?.sales_24,
                price_symbol: paymentToken?.symbol || 'ETH',
                price_token_address: paymentToken?.address || '',
            },
            tickers,
        }
    }
}
