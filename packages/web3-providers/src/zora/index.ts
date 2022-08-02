import urlcat from 'urlcat'
import { first } from 'lodash-es'
import { GraphQLClient } from 'graphql-request'
import getUnixTime from 'date-fns/getUnixTime'
import { EMPTY_LIST } from '@masknet/shared-base'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    CurrencyType,
    HubIndicator,
    HubOptions,
    NonFungibleAsset,
    NonFungibleTokenCollection,
    NonFungibleTokenEvent,
    NonFungibleTokenOrder,
    OrderSide,
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
} from './types'
import type { NonFungibleTokenAPI } from '../types'
import { GetCollectionsByKeywordQuery, GetEventsQuery, GetTokenQuery } from './queries'
import { ZORA_MAINNET_GRAPHQL_URL } from './constants'

export class ZoraAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    private client = new GraphQLClient(ZORA_MAINNET_GRAPHQL_URL)

    private createZoraLink(chainId: ChainId, address: string, tokenId: string) {
        return urlcat('https://zora.co/collections/:address/:tokenId', {
            address,
            tokenId,
        })
    }

    private createNonFungibleAssetFromToken(chainId: ChainId, token: Token): NonFungibleAsset<ChainId, SchemaType> {
        const shared = {
            chainId,
            address: token.tokenContract?.collectionAddress ?? token.collectionAddress,
            name: token.tokenContract?.name ?? token.name ?? token.collectionName ?? 'Unknown Token',
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
            },
            traits:
                token.attributes
                    ?.filter((x) => x.traitType && x.value)
                    .map((x) => ({
                        type: x.traitType!,
                        value: x.value!,
                    })) ?? EMPTY_LIST,
            price: token.mimtInfo?.price.usdcPrice?.decimals
                ? {
                      [CurrencyType.USD]: token.mimtInfo?.price.usdcPrice.decimals.toString(),
                  }
                : undefined,
            priceInToken: token.mimtInfo?.price.nativePrice.raw
                ? {
                      amount: token.mimtInfo?.price.nativePrice.raw,
                      token: createNativeToken(chainId),
                  }
                : undefined,
            owner: token.owner
                ? {
                      address: token.owner,
                  }
                : undefined,
            ownerId: token.owner,
        }
    }

    private createNonFungibleCollectionFromCollection(
        chainId: ChainId,
        collection: Collection,
    ): NonFungibleTokenCollection<ChainId, SchemaType> {
        return {
            chainId,
            address: collection.address,
            name: collection.name ?? 'Unknown Token',
            symbol: collection.symbol ?? 'UNKNOWN',
            slug: collection.symbol ?? 'UNKNOWN',
            description: collection.description,
            schema: SchemaType.ERC721,
        }
    }

    private createNonFungibleEventFromEvent(
        chainId: ChainId,
        event: Event<MintEventProperty | SaleEventProperty | TransferEventProperty>,
    ): NonFungibleTokenEvent<ChainId, SchemaType> {
        const pairs = event.properties?.map((x) => {
            const mintEventProperty = x as MintEventProperty
            if (mintEventProperty.originatorAddress && mintEventProperty.toAddress)
                return {
                    from: mintEventProperty.originatorAddress,
                    to: mintEventProperty.toAddress,
                }

            const saleEventProperty = x as SaleEventProperty
            if (saleEventProperty.buyerAddress && saleEventProperty.sellerAddress)
                return {
                    from: saleEventProperty.sellerAddress,
                    to: saleEventProperty.buyerAddress,
                }

            const transferEventProperty = x as TransferEventProperty
            if (transferEventProperty.fromAddress && transferEventProperty.toAddress) {
                return {
                    from: transferEventProperty.fromAddress,
                    to: transferEventProperty.toAddress,
                }
            }
            return
        })
        const pair = pairs?.find((x) => x?.from && x.to)

        return {
            id: event.transactionInfo.transactionHash ?? `${event.transactionInfo.blockNumber}_${event.tokenId}`,
            chainId,
            quantity: '1',
            from: {
                address: pair?.from,
            },
            to: {
                address: pair?.to,
            },
            timestamp: getUnixTime(new Date(event.transactionInfo.blockTimestamp)),
            hash: event.transactionInfo.transactionHash,
            type: event.eventType,
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
        }

        switch (event.eventType) {
            case EventType.SALE_EVENT:
                const saleProperty = first(event.properties) as SaleEventProperty | undefined
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

    async getAsset(address: string, tokenId: string) {
        const token = await this.client.request<Token>(GetTokenQuery, {
            address,
            tokenId,
        })
        if (!token) return
        return this.createNonFungibleAssetFromToken(ChainId.Mainnet, token)
    }

    async getEventsFiltered<T extends unknown>(address: string, tokenId: string, predicate?: (x: Event<T>) => boolean) {
        const events = await this.client.request<Array<Event<T>>>(GetEventsQuery, {
            address,
            tokenId,
        })
        const events_ = predicate ? events.filter(predicate) : events
        return events_ as Array<Event<T>>
    }

    async getEvents(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        const events = await this.getEventsFiltered<MintEventProperty | SaleEventProperty | TransferEventProperty>(
            address,
            tokenId,
            (x) => [EventType.MINT_EVENT, EventType.SALE_EVENT, EventType.TRANSFER_EVENT].includes(x.eventType),
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
        const events = await this.getEventsFiltered<SaleEventProperty | V3AskEventProperty>(address, tokenId, (x) =>
            [EventType.SALE_EVENT, EventType.V1_MARKET_EVENT].includes(x.eventType),
        )
        const orders = events.length
            ? events.map((x) => this.createNonFungibleOrderFromEvent(chainId, x)).filter((x) => x.side === side)
            : EMPTY_LIST
        return this.createPageable(orders, indicator)
    }

    async getCollectionsByKeyword(
        keyword: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        const collections = await this.client.request<Collection[]>(GetCollectionsByKeywordQuery, {
            keyword,
        })
        if (!collections.length) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const collections_ = collections.map((x) => this.createNonFungibleCollectionFromCollection(chainId, x))
        return this.createPageable(collections_, indicator)
    }
}
