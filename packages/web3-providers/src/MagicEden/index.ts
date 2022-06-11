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
import { ChainId, SchemaType } from '@masknet/web3-shared-solana'
import urlcat from 'urlcat'
import { courier } from '../helpers'
import type { NonFungibleTokenAPI } from '../types'
import { MAGIC_EDEN_API_URL } from './constants'
import type {
    Auction,
    MagicEdenCollection as Collection,
    MagicEdenNFT,
    MagicEdenToken,
    TokenActivity,
    WalletOffer,
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

function createNFTToken(token: MagicEdenToken, collection: Collection): NonFungibleToken<ChainId, SchemaType> {
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
            urlcat('/v2/tokens/:mint_address', { mint_address: tokenMint }),
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
                address: token.mintAddress,
                metadata: {
                    chainId: ChainId.Mainnet,
                    name: token.collectionName,
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
                    name: token.collectionName,
                    slug: '',
                    description: '',
                    iconURL: '',
                    verified: false,
                },
            }
        })
        return createPageable(data, createIndicator(indicator))
    }

    async getAsset(address: string, tokenMint: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const [token, auction, nft] = await Promise.all([
            this.getToken(address, tokenMint),
            fetchFromMagicEden<Auction>(urlcat('/auctions/token-mint/:mint_address', { mint_address: tokenMint })),
            fetchFromMagicEden<MagicEdenNFT>(
                urlcat('/rpc/getNFTByMintAddress/:mint_address', { mint_address: tokenMint }),
            ),
        ])
        const link = urlcat('https://magiceden.io/item-details/:mint_address', {
            mint_address: tokenMint,
        })
        if (!token) return
        return {
            ...token,
            link,
            auction: auction
                ? {
                      endAt: Date.parse(auction.config.endDate),
                      // TODO
                      orderTokens: [],
                      // TODO
                      offerTokens: [],
                  }
                : undefined,
            creator: nft?.creators.length
                ? {
                      address: nft.creators[0].address,
                      nickname: 'Unknown',
                  }
                : undefined,
            owner: {
                address: nft?.owner,
                nickname: 'Unknown',
            },
            traits: auction?.attributes.map((x) => ({
                type: x.trait_type,
                value: x.value,
            })),
            orders: auction?.bids
                ? auction.bids.map((x) => ({
                      id: x.bid,
                      chainId: ChainId.Mainnet,
                      asset_permalink: link,
                      hash: x.bid,
                      quantity: '1',
                      createdAt: x.timestamp * 1000,
                      paymentToken: createFungibleToken<ChainId.Mainnet, SchemaType.Fungible | SchemaType.Native>(
                          ChainId.Mainnet,
                          SchemaType.Native,
                          auction.config.payees[0].address,
                          'Sol',
                          'Sol',
                          9,
                      ),
                  }))
                : [],
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

    async getHistory(address: string, tokenId: string, { indicator, size = 50 }: HubOptions<ChainId> = {}) {
        const activities = await fetchFromMagicEden<TokenActivity[]>(
            urlcat('/v2/tokens/:mint_address/activities', {
                mint_address: tokenId,
                offset: (indicator?.index ?? 0) * size,
                limit: size,
            }),
        )
        return (activities || []).map((activity) => {
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
                quantity: '1',
                type: '',
            }
        })
    }

    async getOrders(_: string, mintAddress: string, side: OrderSide, { indicator, size }: HubOptions<ChainId> = {}) {
        const limit = size || 20
        const offset = (indicator?.index ?? 0) * limit
        const offers = await fetchFromMagicEden<WalletOffer[]>(
            urlcat('/tokens/:mint_address/offer_received', {
                mint_address: mintAddress,
                side,
                offset,
                limit,
            }),
        )
        return (offers || []).map((offer) => {
            return {
                id: offer.pdaAddress,
                chainId: ChainId.Mainnet,
                quantity: '1',
                // TODO's
                asset_permalink: '',
            }
        })
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
