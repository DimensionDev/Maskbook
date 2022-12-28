import urlcat from 'urlcat'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    HubIndicator,
    HubOptions,
    NonFungibleAsset,
    NonFungibleTokenContract,
    NonFungibleTokenEvent,
    NonFungibleTokenOrder,
    NonFungibleTokenStats,
    OrderSide,
    Pageable,
    SourceType,
    TokenType,
} from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import { ChainId, createERC20Token, formatWeiToEther, isValidChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { Collection, Event, Order, Stats, Token } from './types.js'
import { LOOKSRARE_API_URL, LOOKSRARE_PAGE_SIZE } from './constants.js'
import { getPaymentToken, resolveActivityType } from '../entry-helpers.js'
import type { NonFungibleTokenAPI } from '../entry-types.js'

async function fetchFromLooksRare<T>(chainId: ChainId, url: string) {
    if (![ChainId.Mainnet, ChainId.Rinkeby, ChainId.Matic].includes(chainId)) return
    const response = await fetch(urlcat(LOOKSRARE_API_URL, url), { method: 'GET' })
    if (response.ok) return (await response.json()) as T
    return
}

function createAssetLink(chainId: ChainId, address: string, tokenId: string) {
    return urlcat('https://looksrare.org/collections/:address/:tokenId', {
        address,
        tokenId,
    })
}

function createNonFungibleAssetFromToken(
    chainId: ChainId,
    token?: Token,
): NonFungibleAsset<ChainId, SchemaType> | undefined {
    if (!token) return

    const shared = {
        chainId,
        name: token.collection?.name ?? 'Unknown Token',
        symbol: token.collection?.symbol ?? 'UNKNOWN',
        address: token.collectionAddress,
        description: token.collection?.description,
        schema: token.collection?.type === 'ERC1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
    }

    return {
        id: token.id.toString(),
        chainId,
        type: TokenType.NonFungible,
        schema: shared.schema,
        address: token.collectionAddress,
        tokenId: token.tokenId,
        ownerId: token.collection?.owner,
        contract: {
            ...shared,
            owner: token.collection?.owner,
        },
        metadata: {
            ...shared,
            imageURL: token.imageURI,
            mediaURL: token.imageURI,
        },
        collection: {
            ...shared,
            slug: token.collection?.name ?? '',
            verified: token.collection?.isVerified,
        },
        link: createAssetLink(chainId, token.collectionAddress, token.tokenId),
        creator: {
            address: token.collection?.owner,
        },
        owner: {
            address: token.collection?.owner,
        },
        traits: token.attributes.map((x) => ({
            type: x.displayType,
            value: x.value,
        })),
        source: SourceType.LooksRare,
    }
}

function createNonFungibleContractFromCollection(
    chainId: ChainId,
    collection?: Collection,
): NonFungibleTokenContract<ChainId, SchemaType> | undefined {
    if (!collection) return
    return {
        chainId,
        name: collection.name ?? 'Unknown Token',
        symbol: collection.symbol ?? 'UNKNOWN',
        address: collection.address,
        schema: collection.type === 'ERC1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
        owner: collection.owner,
        source: SourceType.LooksRare,
    }
}

function createNonFungibleEventFromEvent(chainId: ChainId, event: Event): NonFungibleTokenEvent<ChainId, SchemaType> {
    return {
        id: event.id.toString(),
        chainId,
        type: resolveActivityType(event.type),
        assetPermalink: urlcat('https://looksrare.org/collections/:address/:tokenId', {
            address: event.token?.collectionAddress ?? event.collection?.address,
            tokenId: event.token?.tokenId,
        }),
        assetSymbol: event.collection?.symbol,
        quantity: '1',
        hash: event.hash,
        from: {
            address: event.from,
        },
        to: {
            address: event.to,
        },
        timestamp: Number.parseInt(event.createdAt, 10) * 1000,
        source: SourceType.LooksRare,
    }
}

function createNonFungibleTokenOrderFromOrder(
    chainId: ChainId,
    order: Order,
): NonFungibleTokenOrder<ChainId, SchemaType> {
    const paymentToken = getPaymentToken(chainId, { address: order.currencyAddress })
    return {
        id: order.hash,
        chainId,
        quantity: order.amount.toString(),
        hash: order.hash,
        side: order.isOrderAsk ? OrderSide.Sell : OrderSide.Buy,
        assetPermalink: urlcat('https://looksrare.org/collections/:address/:tokenId', {
            address: order.collectionAddress,
            tokenId: order.tokenId,
        }),
        maker: {
            address: order.signer,
        },
        createdAt: order.startTime,
        expiredAt: order.endTime,
        priceInToken: {
            amount: order.price,
            token: paymentToken ?? createERC20Token(chainId, order.currencyAddress),
        },
        source: SourceType.LooksRare,
    }
}

export class LooksRareAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return
        const response = await fetchFromLooksRare<{
            data: Token
        }>(
            chainId,
            urlcat('/api/v1/tokens', {
                collection: address,
                tokenId,
            }),
        )
        return createNonFungibleAssetFromToken(chainId, response?.data)
    }

    async getAssets(
        account: string,
        options?: HubOptions<ChainId, HubIndicator>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }

    async getContract(
        address: string,
        { chainId = ChainId.Mainnet }: HubOptions<ChainId, HubIndicator> = {},
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType> | undefined> {
        if (!isValidChainId(chainId)) return

        const response = await fetchFromLooksRare<{
            data: Collection
        }>(chainId, address)
        return createNonFungibleContractFromCollection(chainId, response?.data)
    }

    async getEvents(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const response = await fetchFromLooksRare<{
            data: Event[]
        }>(
            chainId,
            urlcat('/api/v1/events', {
                collection: address,
                tokenId,
                pagination: indicator
                    ? JSON.stringify({
                          first: indicator.index * LOOKSRARE_PAGE_SIZE,
                          cursor: indicator.id,
                      })
                    : undefined,
            }),
        )

        if (!response?.data.length) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const events = response.data.map((x) => createNonFungibleEventFromEvent(chainId, x))
        return createPageable(
            events,
            createIndicator(indicator),
            events.length ? createNextIndicator(indicator) : undefined,
        )
    }

    async getStats(
        address: string,
        { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {},
    ): Promise<NonFungibleTokenStats | undefined> {
        if (!isValidChainId(chainId)) return
        const response = await fetchFromLooksRare<{
            data: Stats
        }>(
            chainId,
            urlcat('/api/v1/collections/stats', {
                address,
            }),
        )
        const stats = response?.data
        if (!stats) return

        return {
            count24h: stats.count24h,
            volume24h: formatWeiToEther(stats.volume24h).toNumber(),
            floorPrice: formatWeiToEther(stats.floorPrice).toNumber(),
        }
    }

    async getOrders(
        address: string,
        tokenId: string,
        side: OrderSide,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const response = await fetchFromLooksRare<{
            data: Order[]
        }>(
            chainId,
            urlcat('/api/v1/orders', {
                // For ask (aka. listing) set true. For bid (aka. offer) set false.
                isOrderAsk: side === OrderSide.Sell,
                collection: address,
                tokenId,
                pagination: indicator
                    ? JSON.stringify({
                          first: indicator.index * LOOKSRARE_PAGE_SIZE,
                      })
                    : undefined,
                sort: 'NEWEST',
            }),
        )

        if (!response?.data.length) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const orders = response.data.map((x) => createNonFungibleTokenOrderFromOrder(chainId, x))
        return createPageable(
            orders,
            createIndicator(indicator),
            orders.length ? createNextIndicator(indicator) : undefined,
        )
    }

    async getOffers(address: string, tokenId: string, options?: HubOptions<ChainId, HubIndicator> | undefined) {
        return this.getOrders(address, tokenId, OrderSide.Buy, options)
    }

    async getListings(address: string, tokenId: string, options?: HubOptions<ChainId, HubIndicator> | undefined) {
        return this.getOrders(address, tokenId, OrderSide.Sell, options)
    }
}
