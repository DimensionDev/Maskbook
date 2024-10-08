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
    type Days,
} from '@masknet/shared-base'
import {
    SourceType,
    type NonFungibleAsset,
    type NonFungibleCollection,
    type NonFungibleTokenActivity,
    TokenType,
    leftShift,
    type NonFungibleCollectionOverview,
} from '@masknet/web3-shared-base'
import { formatBalance } from '@masknet/web3-shared-base'
import { subSeconds, isAfter, secondsToMilliseconds, millisecondsToSeconds } from 'date-fns'
import { ChainId, SchemaType, isValidChainId, ZERO_ADDRESS, isValidAddress } from '@masknet/web3-shared-evm'
import {
    fetchFromSimpleHash,
    createNonFungibleAsset,
    resolveChain,
    createNonFungibleCollection,
    resolveChainId,
    getAllChainNames,
    resolveEventType,
    resolveSimpleHashRange,
    checkBlurToken,
    isLensFollower,
} from '../helpers.js'
import { OpenSea } from '../../OpenSea/index.js'
import { getContractSymbol } from '../../helpers/getContractSymbol.js'
import { NonFungibleMarketplace } from '../../NFTScan/helpers/utils.js'
import { EVMChainResolver, EVMExplorerResolver } from '../../Web3/EVM/apis/ResolverAPI.js'
import type { BaseHubOptions, NonFungibleTokenAPI, TrendingAPI } from '../../entry-types.js'
import { historicalPriceState } from '../historicalPriceState.js'
import { SIMPLE_HASH_HISTORICAL_PRICE_START_TIME, SPAM_SCORE } from '../constants.js'
import { SimpleHash } from '../../types/SimpleHash.js'

class SimpleHashAPI_EVM implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getCollectionByContractAddress(
        address: string,
        { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {},
    ): Promise<SimpleHash.Collection | undefined> {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!chain || !address || !isValidChainId(chainId)) return
        const path = urlcat('/api/v0/nfts/collections/:chain/:address', {
            chain,
            address,
        })

        const { collections } = await fetchFromSimpleHash<{ collections: SimpleHash.Collection[] }>(path)

        return collections[0]
    }

    async getAsset(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, account }: BaseHubOptions<ChainId> = {},
        skipScoreCheck = false,
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!chain || !address || !tokenId || !isValidChainId(chainId)) return
        const path = urlcat('/api/v0/nfts/:chain/:address/:tokenId', {
            chain,
            address,
            tokenId,
        })
        const response = await fetchFromSimpleHash<SimpleHash.Asset>(path)
        const asset = createNonFungibleAsset(response, skipScoreCheck)

        if (asset?.schema === SchemaType.ERC1155 && account) {
            const pathToQueryOwner = urlcat('/api/v0/nfts/contracts', {
                chains: chain,
                wallet_addresses: account,
                contract_addresses: asset.address,
            })

            const ownershipResponse = await fetchFromSimpleHash<{ wallets: SimpleHash.Ownership[] }>(pathToQueryOwner)

            if (ownershipResponse.wallets?.[0]?.contracts?.[0].token_ids?.includes(asset.tokenId)) {
                asset.owner = { address: account }
            }
        }

        return asset
    }

    async getOwnersByContract(
        address: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: BaseHubOptions<ChainId> = {},
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        const path = urlcat('/api/v0/nfts/owners/:chain/:contract_address', {
            chain,
            contract_address: address,
            cursor: indicator?.id || undefined,
            limit: size,
        })
        const response = await fetchFromSimpleHash<{ next_cursor: string; owners: SimpleHash.Owner[] }>(path)
        return createPageable(
            response.owners,
            indicator,
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        )
    }

    async getPoapEvent(eventId: number, { indicator, size = 20 }: Omit<BaseHubOptions<ChainId>, 'chainId'> = {}) {
        const path = urlcat('/api/v0/nfts/poap_event/:event_id', {
            cursor: indicator?.id || undefined,
            limit: size,
            event_id: eventId,
            count: 1,
        })
        const response = await fetchFromSimpleHash<{ next_cursor: string; nfts: SimpleHash.Asset[]; count?: number }>(
            path,
        )
        return createPageable(
            response.nfts,
            indicator,
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
            response.count,
        )
    }

    async getTopCollectorsByContract(
        address: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: BaseHubOptions<ChainId> = {},
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        const path = urlcat('/api/v0/nfts/top_collectors/:chain/:contract_address', {
            chain,
            contract_address: address,
            cursor: indicator?.id || undefined,
            limit: size,
            include_owner_image: '1',
        })
        const response = await fetchFromSimpleHash<{ next_cursor: string; top_collectors: SimpleHash.TopCollector[] }>(
            path,
        )
        return createPageable(
            response.top_collectors,
            indicator,
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        )
    }

    async getCollectionOverview(chainId: ChainId, id: string): Promise<NonFungibleCollectionOverview | undefined> {
        // SimpleHash collection id is not address
        if (isValidAddress(id)) return
        const path = urlcat('/api/v0/nfts/collections_activity', {
            collection_ids: id,
        })

        const response = await fetchFromSimpleHash<{ collections: SimpleHash.CollectionOverview[] }>(path)
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

    async getAssets(
        account: string,
        {
            chainId = ChainId.Mainnet,
            indicator,
            contractAddress = '',
        }: BaseHubOptions<ChainId> & {
            contractAddress?: string
        } = {},
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!account || !isValidChainId(chainId) || !chain) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }
        const path = urlcat('/api/v0/nfts/owners', {
            chains: chain,
            wallet_addresses: account,
            contract_addresses: contractAddress,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        })

        const response = await fetchFromSimpleHash<{ next_cursor: string; nfts: SimpleHash.Asset[] }>(path)
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
        { chainId = ChainId.Mainnet, indicator }: BaseHubOptions<ChainId> = {},
        skipScoreCheck = false,
    ) {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)
        if (!chain || !address || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }

        const path = urlcat(`/api/v0/nfts/${chain}/:address`, {
            address,
            cursor: typeof indicator?.index !== 'undefined' && indicator.index !== 0 ? indicator.id : undefined,
        })

        const response = await fetchFromSimpleHash<{ next_cursor: string; nfts: SimpleHash.Asset[] }>(path)

        const assets = response.nfts.map((x) => createNonFungibleAsset(x, skipScoreCheck)).filter(Boolean) as Array<
            NonFungibleAsset<ChainId, SchemaType>
        >

        return createPageable(
            assets,
            createIndicator(indicator),
            response.next_cursor ? createNextIndicator(indicator, response.next_cursor) : undefined,
        )
    }

    async getCoinPriceStats(collectionId: string, days: Days): Promise<TrendingAPI.Stat[]> {
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
                floor_prices: SimpleHash.PriceStat[]
                payment_token: SimpleHash.PaymentToken
            }>(path)

            const firstFloorPriceTimeStamp = response.floor_prices?.[0]?.timestamp
            cursor =
                (
                    !firstFloorPriceTimeStamp ||
                    isAfter(secondsToMilliseconds(from_timeStamp), new Date(firstFloorPriceTimeStamp))
                ) ?
                    null
                :   response.next_cursor

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
                floor_prices: SimpleHash.PriceStat[]
                payment_token: SimpleHash.PaymentToken
            }>(path)

            cursor = response.next_cursor
            historicalPriceState.updatePriceState(collectionId, response.floor_prices, response.payment_token)
        }

        historicalPriceState.updateAllLoadedIdListState(collectionId)

        return historicalPriceState.getHighestPrice(collectionId)
    }

    async getOneDaySaleAmounts(collectionId: string) {
        // SimpleHash collection id is not address
        if (isValidAddress(collectionId)) return
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
                (
                    !firstFloorPriceTimeStamp ||
                    isAfter(secondsToMilliseconds(from_timeStamp), new Date(firstFloorPriceTimeStamp))
                ) ?
                    null
                :   response.next_cursor

            sales = sales.concat(response.transfers)
        }

        return sales.filter((x) => isAfter(new Date(x.timestamp), secondsToMilliseconds(from_timeStamp))).length
    }

    async getCollectionsByOwner(
        account: string,
        { chainId, indicator, allChains, schemaType }: BaseHubOptions<ChainId> = {},
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>> {
        const pluginId = NetworkPluginID.PLUGIN_EVM
        const isERC712Only = schemaType === SchemaType.ERC721
        const chain = allChains || !chainId ? getAllChainNames(pluginId) : resolveChain(pluginId, chainId)
        if (!chain || !account || !isValidChainId(chainId)) {
            return createPageable(EMPTY_LIST, createIndicator(indicator))
        }

        const path = urlcat('/api/v0/nfts/collections_by_wallets', {
            chains: chain,
            wallet_addresses: account,
            nft_ids: 1,
        })

        const response = await fetchFromSimpleHash<{ collections: SimpleHash.Collection[] }>(path)

        const filteredCollections = response.collections
            // Might got bad data responded including id field and other fields empty
            .filter((x) => {
                if (!x.id || (x.spam_score !== null && x.spam_score >= SPAM_SCORE)) return false
                return (
                    isValidChainId(resolveChainId(x.chain)) &&
                    x.top_contracts.length > 0 &&
                    (!isLensFollower(x.name) || !isERC712Only)
                )
            })

        let erc721CollectionIdList: string[] = EMPTY_LIST

        if (isERC712Only) {
            const nftIdList = filteredCollections.map((x) => x.nft_ids?.[0] || '').filter(Boolean)
            while (nftIdList.length) {
                const batchAssetsPath = urlcat('/api/v0/nfts/assets', {
                    nft_ids: nftIdList.splice(0, 50).join(','),
                })

                const batchAssetsResponse = await fetchFromSimpleHash<{
                    nfts: SimpleHash.Asset[]
                }>(batchAssetsPath)

                erc721CollectionIdList = erc721CollectionIdList.concat(
                    batchAssetsResponse.nfts
                        .filter((x) => x.contract.type === 'ERC721')
                        .map((x) => x.collection.collection_id),
                )
            }
        }

        const collections = filteredCollections
            .filter((x) => !isERC712Only || erc721CollectionIdList.includes(x.id))
            .map((x) => createNonFungibleCollection(x))

        return createPageable(collections, createIndicator(indicator))
    }

    async getAssetsByCollectionAndOwner(
        collectionId: string,
        owner: string,
        { chainId = ChainId.Mainnet, indicator, size = 50 }: BaseHubOptions<ChainId> = {},
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

        const response = await fetchFromSimpleHash<{ nfts: SimpleHash.Asset[]; next_cursor: string }>(path)

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
        const collection = await this.getSimpleHashCollection(id)
        if (!collection) return []
        const marketplaces = collection.marketplace_pages?.filter((x) => x.verified) || []
        return marketplaces.map((x) => x.marketplace_name)
    }

    async getCoinActivities(
        chainId: ChainId,
        id: string,
        cursor: string,
    ): Promise<{ content: Array<NonFungibleTokenActivity<ChainId, SchemaType>>; cursor: string } | undefined> {
        const chain = resolveChain(NetworkPluginID.PLUGIN_EVM, chainId)

        if (!chain || !isValidChainId(chainId) || !id) return

        const path = urlcat('/api/v0/nfts/transfers/:chain/:id', {
            id,
            chain,
            cursor: cursor ? cursor : undefined,
            order_by: 'timestamp_desc',
            limit: 50,
        })
        const response = await fetchFromSimpleHash<{
            next_cursor: string
            transfers: SimpleHash.Activity[]
        }>(path)

        if (!response?.transfers?.length) return

        const batchAssetsPath = urlcat('/api/v0/nfts/assets', {
            nft_ids: response.transfers.map((x) => x.nft_id).join(','),
        })

        const batchAssetsResponse = await fetchFromSimpleHash<{
            nfts: SimpleHash.Asset[]
        }>(batchAssetsPath)

        return {
            cursor: response.next_cursor,
            content: response.transfers.map((x) => {
                const trade_token =
                    (
                        !x.sale_details.payment_token ||
                        checkBlurToken(NetworkPluginID.PLUGIN_EVM, chainId, x.sale_details.payment_token.address || '')
                    ) ?
                        EVMChainResolver.nativeCurrency(chainId)
                    :   {
                            ...x.sale_details.payment_token,
                            type: TokenType.Fungible,
                            address:
                                x.sale_details.payment_token.payment_token_id.includes('native') ?
                                    ZERO_ADDRESS
                                :   x.sale_details.payment_token.address ?? '',
                            id:
                                x.sale_details.payment_token.payment_token_id.includes('native') ?
                                    ZERO_ADDRESS
                                :   x.sale_details.payment_token.address ?? '',
                            chainId,
                            schema: SchemaType.ERC20,
                        }
                const imageURL = batchAssetsResponse.nfts.find((y) => y.nft_id === x.nft_id)?.image_url ?? ''
                return {
                    hash: x.transaction,
                    from: x.from_address,
                    token_id: x.token_id,
                    transaction_link: EVMExplorerResolver.transactionLink(chainId, x.transaction),
                    event_type: resolveEventType(x.event_type),
                    send: x.from_address,
                    receive: x.event_type === SimpleHash.ActivityType.Burn ? ZERO_ADDRESS : x.to_address,
                    to: x.event_type === SimpleHash.ActivityType.Burn ? ZERO_ADDRESS : x.to_address,
                    trade_token,
                    timestamp: new Date(x.timestamp).getTime(),
                    trade_price:
                        x.sale_details.total_price ?
                            leftShift(x.sale_details.total_price, trade_token.decimals).toNumber()
                        :   0,
                    imageURL,
                    contract_address: x.contract_address,
                    trade_symbol: trade_token.symbol ?? '',
                    token_address: trade_token.address ?? '',
                }
            }),
        }
    }

    async getCoinTrending(chainId: ChainId, address: string): Promise<TrendingAPI.Trending | undefined> {
        const collection = await this.getCollectionByContractAddress(address, { chainId })
        if (!collection) {
            throw new Error(`SimpleHash: Can not find collection by address ${address}, chainId ${chainId}`)
        }

        const [symbol, openseaStats] = await Promise.all([
            getContractSymbol(chainId, address),
            OpenSea.getStats(address).catch(() => null),
        ])

        const paymentToken = collection.floor_prices[0]?.payment_token

        if (!paymentToken) return

        const tickers: TrendingAPI.Ticker[] = compact([
            openseaStats ?
                {
                    logo_url: MaskIconURLs.open_sea_url(),
                    // TODO
                    trade_url: `https://opensea.io/assets/ethereum/${address}`,
                    market_name: NonFungibleMarketplace.OpenSea,
                    volume_24h: openseaStats.volume24h,
                    floor_price: openseaStats.floorPrice,
                    price_symbol: paymentToken.symbol,
                    sales_24: openseaStats.count24h,
                }
            :   null,
        ])

        return {
            lastUpdated: new Date().toJSON(),
            dataProvider: SourceType.SimpleHash,
            contracts: [{ chainId, address, pluginID: NetworkPluginID.PLUGIN_EVM }],
            currency: {
                id: paymentToken.payment_token_id,
                symbol: paymentToken.symbol,
                name: paymentToken.symbol,
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
                        link:
                            collection.instagram_username ?
                                `https://www.instagram.com/${collection.instagram_username}`
                            :   null,
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
                current_price: leftShift(collection.floor_prices[0]?.value, paymentToken.decimals).toString(),
                floor_price: leftShift(collection.floor_prices[0]?.value, paymentToken.decimals).toString(),
                owners_count: collection.distinct_owner_count,
                volume_24h: tickers[0]?.volume_24h,
                total_24h: tickers[0]?.sales_24,
                price_symbol: paymentToken.symbol || 'ETH',
                price_token_address: paymentToken.address || '',
            },
            tickers,
        }
    }

    async getSimpleHashCollection(id: string): Promise<SimpleHash.Collection | undefined> {
        // SimpleHash collection id is not address
        if (isValidAddress(id)) return
        const path = urlcat('/api/v0/nfts/collections/ids', {
            collection_ids: id,
        })
        const response = await fetchFromSimpleHash<{ collections: SimpleHash.Collection[] }>(path)
        return response.collections[0]
    }
}
export const SimpleHashEVM = new SimpleHashAPI_EVM()
