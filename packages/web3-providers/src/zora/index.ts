import urlcat from 'urlcat'
import { GraphQLClient } from 'graphql-request'
import { EMPTY_LIST } from '@masknet/shared-base'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    CurrencyType,
    HubIndicator,
    HubOptions,
    NonFungibleAsset,
    NonFungibleCollection,
    NonFungibleTokenEvent,
    NonFungibleTokenOrder,
    OrderSide,
    Pageable,
    SourceType,
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId, createNativeToken, SchemaType } from '@masknet/web3-shared-evm'
import {
    Collection,
    Event,
    EventType,
    MintEventProperty,
    SaleEventProperty,
    Token,
    TransferEventProperty,
    V3AskEventProperty,
} from './types.js'
import { getAssetFullName, resolveNonFungibleTokenEventActivityType } from '../helpers.js'
import type { NonFungibleTokenAPI } from '../types/index.js'
import { GetCollectionsByKeywordQuery, GetEventsQuery, GetTokenQuery } from './queries.js'
import { ZORA_MAINNET_GRAPHQL_URL } from './constants.js'
import type { Variables } from 'graphql-request/dist/types'

export class ZoraAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    private client = new GraphQLClient(ZORA_MAINNET_GRAPHQL_URL)

    private createZoraLink(chainId: ChainId, address: string, tokenId: string) {
        return urlcat('https://zora.co/collections/:address/:tokenId', {
            address,
            tokenId,
        })
    }

    private async request<T>(chainId: ChainId, query: string, parameters: Variables) {
        if (chainId !== ChainId.Mainnet) return
        const response = await this.client.request<T>(query, parameters)
        return response as T
    }

    private createNonFungibleAssetFromToken(chainId: ChainId, token: Token): NonFungibleAsset<ChainId, SchemaType> {
        const shared = {
            chainId,
            address: token.tokenContract?.collectionAddress ?? token.collectionAddress,
            name: token.tokenContract?.name ?? token.collectionName ?? '',
            symbol: token.tokenContract?.symbol ?? 'UNKNOWN',
            schema: SchemaType.ERC721,
        }
        return {
            id: `${token.collectionAddress}_${token.tokenId}`,
            chainId,
            type: TokenType.NonFungible,
            schema: SchemaType.ERC721,
            link: this.createZoraLink(chainId, token.collectionAddress, token.tokenId),
            address: token.collectionAddress,
            tokenId: token.tokenId,
            contract: {
                ...shared,
                owner: token.owner,
            },
            collection: {
                ...shared,
                slug: token.tokenContract?.symbol ?? 'UNKNOWN',
                description: token.tokenContract?.description ?? token.description,
            },
            metadata: {
                ...shared,
                name: getAssetFullName(shared.name ?? '', token.name, token.tokenId),
            },
            traits:
                token.attributes
                    ?.filter((x) => x.traitType && x.value)
                    .map((x) => ({
                        type: x.traitType!,
                        value: x.value!,
                    })) ?? EMPTY_LIST,
            price: token.mintInfo?.price.usdcPrice?.raw
                ? {
                      [CurrencyType.USD]: token.mintInfo?.price.usdcPrice?.raw,
                  }
                : undefined,
            priceInToken: token.mintInfo?.price.nativePrice.raw
                ? {
                      amount: token.mintInfo?.price.nativePrice.raw,
                      token: createNativeToken(chainId),
                  }
                : undefined,
            owner: token.owner
                ? {
                      address: token.owner,
                  }
                : undefined,
            ownerId: token.owner,
            source: SourceType.Zora,
        }
    }

    private createNonFungibleCollectionFromCollection(
        chainId: ChainId,
        collection: Collection,
    ): NonFungibleCollection<ChainId, SchemaType> {
        return {
            chainId,
            address: collection.collectionAddress,
            name: collection.name ?? 'Unknown Token',
            symbol: collection.entity.symbol ?? 'UNKNOWN',
            slug: collection.entity.symbol ?? 'UNKNOWN',
            description: collection.entity.description ?? collection.description,
            schema: SchemaType.ERC721,
            source: SourceType.Zora,
        }
    }

    private createNonFungibleEventFromEvent(
        chainId: ChainId,
        event: Event<MintEventProperty | SaleEventProperty | TransferEventProperty>,
    ): NonFungibleTokenEvent<ChainId, SchemaType> {
        const pair = (() => {
            const mintEventProperty = event.properties as MintEventProperty
            if (mintEventProperty.originatorAddress && mintEventProperty.toAddress)
                return {
                    from: mintEventProperty.originatorAddress,
                    to: mintEventProperty.toAddress,
                }

            const saleEventProperty = event.properties as SaleEventProperty
            if (saleEventProperty.buyerAddress && saleEventProperty.sellerAddress)
                return {
                    from: saleEventProperty.sellerAddress,
                    to: saleEventProperty.buyerAddress,
                }

            const transferEventProperty = event.properties as TransferEventProperty
            if (transferEventProperty.fromAddress && transferEventProperty.toAddress) {
                return {
                    from: transferEventProperty.fromAddress,
                    to: transferEventProperty.toAddress,
                }
            }
            return
        })()

        const price = (() => {
            const mintEventProperty = event.properties as MintEventProperty
            const saleEventProperty = event.properties as SaleEventProperty
            const price = mintEventProperty.price || saleEventProperty.price
            if (price.usdcPrice)
                return {
                    price: price.usdcPrice?.raw
                        ? {
                              [CurrencyType.USD]: price.usdcPrice?.raw,
                          }
                        : undefined,
                    priceInToken: price.nativePrice.raw
                        ? {
                              amount: price.nativePrice.raw,
                              token: createNativeToken(chainId),
                          }
                        : undefined,
                }
            return
        })()

        return {
            id: event.transactionInfo.transactionHash ?? `${event.transactionInfo.blockNumber}_${event.tokenId}`,
            type: resolveNonFungibleTokenEventActivityType(event.eventType),
            chainId,
            quantity: '1',
            from: {
                address: pair?.from,
            },
            to: {
                address: pair?.to,
            },
            timestamp: new Date(event.transactionInfo.blockTimestamp).getTime(),
            hash: event.transactionInfo.transactionHash,
            ...price,
            source: SourceType.Zora,
        }
    }

    private createNonFungibleOrderFromEvent(
        chainId: ChainId,
        event: Event<SaleEventProperty | V3AskEventProperty>,
    ): NonFungibleTokenOrder<ChainId, SchemaType> {
        const shared = {
            id: event.transactionInfo.transactionHash ?? `${event.transactionInfo.blockNumber}_${event.tokenId}`,
            chainId,
            assetPermalink:
                event.collectionAddress && event.tokenId
                    ? this.createZoraLink(chainId, event.collectionAddress, event.tokenId)
                    : '',
            quantity: '1',
            hash: event.transactionInfo.transactionHash,
            source: SourceType.Zora,
        }

        switch (event.eventType) {
            case EventType.SALE_EVENT:
                const saleProperty = event.properties as SaleEventProperty | undefined
                return {
                    ...shared,
                    side: OrderSide.Sell,
                    maker: saleProperty
                        ? {
                              address: saleProperty.sellerAddress,
                          }
                        : undefined,
                    taker: saleProperty
                        ? {
                              address: saleProperty.buyerAddress,
                          }
                        : undefined,
                }
            case EventType.V3_ASK_EVENT:
                return {
                    ...shared,
                    side: OrderSide.Buy,
                }
            default:
                return {
                    ...shared,
                }
        }
    }

    private createPageable<T>(items: T[], indicator?: HubIndicator) {
        return createPageable(
            items,
            createIndicator(indicator),
            items.length ? createNextIndicator(indicator) : undefined,
        )
    }

    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const token = await this.request<{
            token: {
                token: Token
            }
        }>(chainId, GetTokenQuery, {
            address,
            tokenId,
        })
        if (!token) return
        return this.createNonFungibleAssetFromToken(ChainId.Mainnet, token.token.token)
    }

    async getAssets(
        account: string,
        options?: HubOptions<ChainId, HubIndicator>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }

    private async getEventsFiltered<T extends unknown>(
        chainId: ChainId,
        address: string,
        tokenId: string,
        eventTypes: EventType[],
    ) {
        const response = await this.request<{
            events: {
                nodes: Array<Event<T>>
            }
        }>(chainId, GetEventsQuery, {
            address,
            tokenId,
            eventTypes,
        })
        return response?.events.nodes ?? EMPTY_LIST
    }

    async getEvents(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        const events = await this.getEventsFiltered<MintEventProperty | SaleEventProperty | TransferEventProperty>(
            chainId,
            address,
            tokenId,
            [EventType.MINT_EVENT, EventType.SALE_EVENT, EventType.TRANSFER_EVENT],
        )
        const events_ = events.length ? events.map((x) => this.createNonFungibleEventFromEvent(chainId, x)) : EMPTY_LIST
        return this.createPageable(events_, indicator)
    }

    async getOffers(address: string, tokenId: string, options: HubOptions<ChainId, HubIndicator> = {}) {
        return this.getOrders(address, tokenId, OrderSide.Buy, options)
    }

    async getListings(address: string, tokenId: string, options: HubOptions<ChainId, HubIndicator> = {}) {
        return this.getOrders(address, tokenId, OrderSide.Sell, options)
    }

    async getOrders(
        address: string,
        tokenId: string,
        side: OrderSide,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        const events = await this.getEventsFiltered<SaleEventProperty | V3AskEventProperty>(
            chainId,
            address,
            tokenId,
            side === OrderSide.Buy ? [EventType.V3_ASK_EVENT] : [EventType.SALE_EVENT],
        )
        const orders = events.length ? events.map((x) => this.createNonFungibleOrderFromEvent(chainId, x)) : EMPTY_LIST
        return this.createPageable(orders, indicator)
    }

    async getCollectionsByKeyword(
        keyword: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        const response = await this.request<{
            search: {
                nodes: Collection[]
            }
        }>(chainId, GetCollectionsByKeywordQuery, {
            keyword,
        })
        const collections = response?.search.nodes
        if (!collections?.length) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const collections_ = collections.map((x) => this.createNonFungibleCollectionFromCollection(chainId, x))
        return this.createPageable(collections_, indicator)
    }
}
