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
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId, createERC20Token, formatWeiToEther, SchemaType } from '@masknet/web3-shared-evm'
import type { NonFungibleTokenAPI } from '../types'
import type { Collection, Event, Order, Stats, Token } from './types'
import { LOOKSRARE_API_URL, LOOKSRARE_PAGE_SIZE } from './constants'

async function fetchFromLooksRare<T>(chainId: ChainId, url: string) {
    if (![ChainId.Mainnet, ChainId.Rinkeby, ChainId.Matic].includes(chainId)) return
    const fetch = globalThis.r2d2Fetch ?? globalThis.fetch

    const response = await fetch(urlcat(LOOKSRARE_API_URL, url), { method: 'GET' })
    if (response.ok) return (await response.json()) as T
    throw new Error('Fetch failed')
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
        link: urlcat('https://looksrare.org/collections/:address/:tokenId', {
            address: token.collectionAddress,
            tokenId: token.tokenId,
        }),
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
    }
}

function createNonFungibleEventFromEvent(chainId: ChainId, event: Event): NonFungibleTokenEvent<ChainId, SchemaType> {
    return {
        id: event.id.toString(),
        chainId,
        type: event.type,
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
        timestamp: Number.parseInt(event.createdAt, 10),
    }
}

function createNonFungibleTokenOrderFromOrder(
    chainId: ChainId,
    order: Order,
): NonFungibleTokenOrder<ChainId, SchemaType> {
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
            token: createERC20Token(chainId, order.currencyAddress),
        },
    }
}

export class LooksRareAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const response = await fetchFromLooksRare<{ data: Token }>(
            chainId,
            urlcat('/api/v1/tokens', {
                collection: address,
                tokenId,
            }),
        )
        return createNonFungibleAssetFromToken(chainId, response?.data)
    }

    async getToken(address: string, tokenId: string, options: HubOptions<ChainId> = {}) {
        return this.getAsset(address, tokenId, options)
    }

    async getContract(
        address: string,
        { chainId = ChainId.Mainnet }: HubOptions<ChainId, HubIndicator> = {},
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType> | undefined> {
        const response = await fetchFromLooksRare<{ data: Collection }>(chainId, address)
        return createNonFungibleContractFromCollection(chainId, response?.data)
    }

    async getEvents(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        const response = await fetchFromLooksRare<{ data: Event[] }>(
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

        if (!response?.data.length) return createPageable([], createIndicator(indicator))
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
        const response = await fetchFromLooksRare<{ data: Stats }>(
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
        const response = await fetchFromLooksRare<{ data: Order[] }>(
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

        if (!response?.data.length) return createPageable([], createIndicator(indicator))
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
