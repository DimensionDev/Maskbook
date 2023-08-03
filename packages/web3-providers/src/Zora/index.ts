import urlcat from 'urlcat'
import { GraphQLClient, type Variables } from 'graphql-request'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type PageIndicator,
    type Pageable,
    EMPTY_LIST,
} from '@masknet/shared-base'
import {
    CurrencyType,
    type NonFungibleAsset,
    type NonFungibleCollection,
    type NonFungibleTokenEvent,
    type NonFungibleTokenOrder,
    OrderSide,
    SourceType,
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType, isValidChainId } from '@masknet/web3-shared-evm'
import { ChainResolverAPI } from '../Web3/EVM/apis/ResolverAPI.js'
import {
    type Collection,
    type Event,
    EventType,
    type MintEventProperty,
    type SaleEventProperty,
    type Token,
    type TransferEventProperty,
    type V3AskEventProperty,
} from './types.js'
import { GetEventsQuery, GetTokenQuery } from './queries.js'
import { ZORA_MAINNET_GRAPHQL_URL } from './constants.js'
import { getAssetFullName } from '../helpers/getAssetFullName.js'
import { resolveActivityType } from '../helpers/resolveActivityType.js'
import type { HubOptions_Base, NonFungibleTokenAPI } from '../entry-types.js'

export class ZoraAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    private ChainResolver = new ChainResolverAPI()

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
                name: getAssetFullName(shared.address, shared.name ?? '', token.name, token.tokenId),
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
                      token: this.ChainResolver.nativeCurrency(chainId),
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
                              token: this.ChainResolver.nativeCurrency(chainId),
                          }
                        : undefined,
                }
            return
        })()

        return {
            id: event.transactionInfo.transactionHash ?? `${event.transactionInfo.blockNumber}_${event.tokenId}`,
            type: resolveActivityType(event.eventType),
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

    private createPageable<T>(items: T[], indicator?: PageIndicator) {
        return createPageable(
            items,
            createIndicator(indicator),
            items.length ? createNextIndicator(indicator) : undefined,
        )
    }

    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions_Base<ChainId> = {}) {
        if (!isValidChainId(chainId)) return
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
        options?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }

    private async getEventsFiltered<T>(chainId: ChainId, address: string, tokenId: string, eventTypes: EventType[]) {
        if (!isValidChainId(chainId)) return []
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
        { chainId = ChainId.Mainnet, indicator }: HubOptions_Base<ChainId> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const events = await this.getEventsFiltered<MintEventProperty | SaleEventProperty | TransferEventProperty>(
            chainId,
            address,
            tokenId,
            [EventType.MINT_EVENT, EventType.SALE_EVENT, EventType.TRANSFER_EVENT],
        )
        const events_ = events.length ? events.map((x) => this.createNonFungibleEventFromEvent(chainId, x)) : EMPTY_LIST
        return this.createPageable(events_, indicator)
    }
}
