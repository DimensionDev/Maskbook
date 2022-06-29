import {
    createFungibleToken,
    createIndicator,
    createNextIndicator,
    createPageable,
    HubOptions,
    NonFungibleToken,
    NonFungibleTokenContract,
    OrderSide,
    TokenType,
} from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-solana'
import urlcat from 'urlcat'
import { courier } from '../helpers'
import type { NonFungibleTokenAPI } from '../types'
import { MAGIC_EDEN_API_URL } from './constants'
import type {
    MagicEdenCollection as Collection,
    MagicEdenNFT,
    MagicEdenToken,
    TokenActivity,
    WalletOffer,
    TokenInListings,
} from './types'
import { toImage } from './utils'

async function fetchFromMagicEden<T>(path: string) {
    try {
        const url = courier(urlcat(MAGIC_EDEN_API_URL, path))
        const response = await fetch(url, {
            method: 'GET',
            headers: { Accept: 'application/json' },
        })
        if (response.ok) {
            return (await response.json()) as T
        }
        return
    } catch {
        return
    }
}

function createNFTToken(
    token: MagicEdenToken,
    collection: Collection,
): NonFungibleToken<ChainId, SchemaType> | undefined {
    const chainId = ChainId.Mainnet
    return {
        id: token.mintAddress,
        chainId,
        ownerId: token.owner,
        type: TokenType.NonFungible,
        schema: SchemaType.NonFungible,
        tokenId: token.mintAddress,
        address: token.mintAddress,
        metadata: {
            chainId,
            name: token.name,
            symbol: collection.symbol,
            description: collection.description,
            imageURL: token.image || token.animationUrl,
            mediaURL: token.animationUrl || token.image,
        },
        contract: {
            chainId,
            schema: SchemaType.NonFungible,
            address: token.mintAddress,
            name: collection.name,
            symbol: collection.symbol,
        },
        collection: {
            chainId,
            name: token.collection,
            slug: token.collection,
            description: collection.description,
            iconURL: collection.image,
            verified: false,
            createdAt: new Date(collection.createdAt).getTime(),
        },
    }
}

function createNFTCollection(collection: Collection): NonFungibleTokenContract<ChainId, SchemaType.NonFungible> {
    return {
        chainId: ChainId.Mainnet,
        name: collection.name,
        symbol: collection.symbol,
        address: '',
        schema: SchemaType.NonFungible,
        logoURL: collection.image,
        iconURL: collection.image,
    }
}

export class MagicEdenAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getToken(address: string, tokenMint: string) {
        const token = await fetchFromMagicEden<MagicEdenToken>(
            urlcat('/v2/tokens/:mint_address', { mint_address: address }),
        )
        if (!token) return
        const collection = await fetchFromMagicEden<Collection>(
            urlcat('/collections/:symbol', { symbol: token?.collection }),
        )
        if (!collection) return
        return createNFTToken(token, collection)
    }

    async getTokens(owner: string, { indicator }: HubOptions<ChainId> = {}) {
        if ((indicator?.index ?? 0) > 0) return createPageable([], createIndicator(indicator))

        const response = await fetchFromMagicEden<{ results: MagicEdenNFT[] }>(
            urlcat('/rpc/getNFTsByOwner/:owner', {
                owner,
            }),
        )
        const tokens = response?.results || []
        const data = tokens.map((token) => {
            return {
                id: token.mintAddress,
                chainId: ChainId.Mainnet,
                type: TokenType.NonFungible,
                schema: SchemaType.NonFungible,
                tokenId: token.mintAddress,
                ownerId: token.owner,
                address: token.mintAddress,
                metadata: {
                    chainId: ChainId.Mainnet,
                    name: token?.title,
                    symbol: '',
                    description: '',
                    imageURL: toImage(token.img),
                    mediaURL: toImage(token.img),
                    owner: token.owner,
                },
                contract: {
                    chainId: ChainId.Mainnet,
                    schema: SchemaType.NonFungible,
                    address: token.mintAddress,
                    name: token.collectionName,
                    symbol: '',
                },
                collection: {
                    chainId: ChainId.Mainnet,
                    name: token.collectionName ?? token?.collectionTitle,
                    slug: '',
                    description: '',
                    iconURL: '',
                    verified: false,
                    address: token.mintAddress,
                },
                link: urlcat('https://magiceden.io/item-details/:mint_address', {
                    mint_address: token.mintAddress,
                }),
                creator: {
                    address: token.properties.creators[0].address || '',
                },
                owner: {
                    address: token.owner,
                },
                traits: token.attributes?.map(({ trait_type, value }) => ({ type: trait_type, value })) ?? [],
            }
        })
        return createPageable(data, createIndicator(indicator))
    }

    async getAsset(address: string, tokenMint: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const [token, offers, listings, events] = await Promise.all([
            this.getToken(address, tokenMint),
            this.getOrders(address, tokenMint, OrderSide.Buy),
            this.getOrders(address, tokenMint, OrderSide.Sell),
            this.getEvents(address, tokenMint),
        ])
        const link = urlcat('https://magiceden.io/item-details/:mint_address', {
            mint_address: tokenMint,
        })
        const combinedOrders = offers.data.concat(listings.data)
        if (!token) return
        return {
            ...token,
            link,
            creator: token.address
                ? {
                      address: token.address,
                      nickname: 'Unknown',
                  }
                : undefined,
            owner: {
                address: token.ownerId,
                nickname: 'Unknown',
            },
            orders: combinedOrders || [],
            events: events.data,
        }
    }

    async getContract(tokenMint: string) {
        const token = await fetchFromMagicEden<MagicEdenToken>(
            urlcat('/v2/tokens/:mint_address', { mint_address: tokenMint }),
        )
        if (!token) return
        const collection = await fetchFromMagicEden<Collection>(
            urlcat('/collections/:symbol', { symbol: token?.collection }),
        )
        if (!collection) return
        return createNFTCollection(collection)
    }

    async getEvents(address: string, tokenId: string, { indicator, size = 50 }: HubOptions<ChainId> = {}) {
        const activities = await fetchFromMagicEden<TokenActivity[]>(
            urlcat('/v2/tokens/:mint_address/activities', {
                mint_address: address,
            }),
        )
        const events = (activities || []).map((activity) => {
            return {
                id: activity.signature,
                chainId: ChainId.Mainnet,
                assetSymbol: activity.collectionSymbol,
                timestamp: activity.blockTime * 1000,
                from: {
                    address: activity.seller,
                },
                to: {
                    address: activity.buyerReferral,
                },
                // TODO's
                quantity: activity.price.toString(),
                type: activity.type,
            }
        })
        return createPageable(
            events,
            createIndicator(indicator),
            events.length === size ? createNextIndicator(indicator) : undefined,
        )
    }

    async getListings(address: string, tokenId: string, { indicator, size }: HubOptions<ChainId> = {}) {
        const listings = await fetchFromMagicEden<TokenInListings[]>(
            urlcat('/v2/tokens/:mint_address/listings', {
                mint_address: address,
            }),
        )

        const orders = (listings || []).map((listing) => {
            return {
                id: listing.pdaAddress,
                chainId: ChainId.Mainnet,
                side: OrderSide.Sell,
                quantity: '1',
                assetPermalink: '',
                hash: '',
                maker: {
                    address: listing.seller,
                    nickname: listing.seller,
                    avatarURL: '',
                    link: urlcat('https://magiceden.io/u/:address', { address: listing.seller }),
                },
                price: {
                    usd: (listing.price * 10 ** 9).toString(),
                },
                priceInToken: {
                    amount: (listing.price * 10 ** 9).toString(),
                    token: createFungibleToken<ChainId.Mainnet, SchemaType.Fungible | SchemaType.Native>(
                        ChainId.Mainnet,
                        SchemaType.Native,
                        listing.seller,
                        'Sol',
                        'Sol',
                        9,
                    ),
                },
            }
        })
        return createPageable(
            orders,
            createIndicator(indicator),
            orders.length === size ? createNextIndicator(indicator) : undefined,
        )
    }

    async getOffers(address: string, tokenId: string, { indicator, size }: HubOptions<ChainId> = {}) {
        const offers = await fetchFromMagicEden<WalletOffer[]>(
            urlcat('/v2/tokens/:mint_address/offers_received', {
                mint_address: address,
            }),
        )

        const orders = (offers || []).map((offer) => {
            return {
                id: offer.pdaAddress,
                chainId: ChainId.Mainnet,
                side: OrderSide.Buy,
                quantity: '1',
                assetPermalink: '',
                hash: '',
                expiresAt: offer.expiry,
                maker: {
                    address: offer.buyer,
                    nickname: offer.buyer,
                    avatarURL: '',
                    link: urlcat('https://magiceden.io/u/:address', { address: offer.buyer }),
                },
                price: {
                    usd: (offer.price * 10 ** 9).toString(),
                },
                priceInToken: {
                    amount: (offer.price * 10 ** 9).toString(),
                    token: createFungibleToken<ChainId.Mainnet, SchemaType.Fungible | SchemaType.Native>(
                        ChainId.Mainnet,
                        SchemaType.Native,
                        offer.buyer,
                        'Sol',
                        'Sol',
                        9,
                    ),
                },
            }
        })
        return createPageable(
            orders,
            createIndicator(indicator),
            orders.length === size ? createNextIndicator(indicator) : undefined,
        )
    }

    async getOrders(address: string, tokenId: string, side: OrderSide, { indicator, size }: HubOptions<ChainId> = {}) {
        switch (side) {
            case OrderSide.Buy:
                return this.getOffers(address, tokenId, { indicator, size })
            case OrderSide.Sell:
                return this.getListings(address, tokenId, { indicator, size })
            default:
                return createPageable(EMPTY_LIST, createIndicator(indicator))
        }
    }

    async getCollections(symbol: string, { indicator, size }: HubOptions<ChainId> = {}) {
        const limit = size || 20
        const offset = (indicator?.index ?? 0) * limit
        const collections = await fetchFromMagicEden<Collection[]>(
            urlcat('/collections/:symbol/listings', { symbol, offset, limit }),
        )
        const chainId = ChainId.Mainnet
        const data = (collections || []).map((collection) => ({
            chainId,
            name: collection.name,
            slug: collection.symbol,
            address: '',
            symbol: collection.symbol,
            iconURL: toImage(collection.image),
        }))
        return createPageable(
            data,
            createIndicator(indicator),
            data.length === limit ? createNextIndicator(indicator) : undefined,
        )
    }
}
