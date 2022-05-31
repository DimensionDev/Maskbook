import { HubOptions, NonFungibleToken, NonFungibleTokenContract, OrderSide, TokenType } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-solana'
import urlcat from 'urlcat'
import type { NonFungibleTokenAPI } from '../types'
import { MAGIC_EDEN_API_URL } from './constants'
import type {
    MagicEdenCollection as Collection,
    MagicEdenNFT,
    MagicEdenToken,
    TokenActivity,
    WalletOffer,
} from './types'
import { toImage } from './utils'

async function fetchFromMagicEden<T>(path: string) {
    try {
        const response = await fetch(urlcat(MAGIC_EDEN_API_URL, path), {
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
            address: '',
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
            urlcat('/v2/tokens/:token_mint', { token_mint: tokenMint }),
        )
        if (!token) return
        const collection = await fetchFromMagicEden<Collection>(
            urlcat('/collections/:symbol', { symbol: token?.collection }),
        )
        if (!collection) return
        return createNFTToken(token, collection)
    }

    async getContract(tokenMint: string) {
        const token = await fetchFromMagicEden<MagicEdenToken>(
            urlcat('/v2/tokens/:token_mint', { token_mint: tokenMint }),
        )
        if (!token) return
        const collection = await fetchFromMagicEden<Collection>(
            urlcat('/collections/:symbol', { symbol: token?.collection }),
        )
        if (!collection) return
        return createNFTCollection(collection)
    }

    async getTokens(owner: string) {
        const response = await fetchFromMagicEden<{ results: MagicEdenNFT[] }>(
            urlcat('/rpc/getNFTsByOwner/:owner', {
                owner,
            }),
        )
        const tokens = response?.results || []
        return {
            // All tokens get returned in single one page
            indicator: 1,
            hasNextPage: false,
            data: tokens.map((token) => {
                const chainId = ChainId.Mainnet
                return {
                    id: token.mintAddress,
                    chainId,
                    type: TokenType.NonFungible,
                    schema: SchemaType.NonFungible,
                    tokenId: token.mintAddress,
                    address: token.mintAddress,
                    metadata: {
                        chainId,
                        name: token.collectionName,
                        symbol: '',
                        description: '',
                        imageURL: toImage(token.img),
                        mediaURL: toImage(token.img),
                    },
                    contract: {
                        chainId,
                        schema: SchemaType.NonFungible,
                        address: '',
                        name: token.collectionName,
                        symbol: '',
                    },
                    collection: {
                        chainId,
                        name: token.collectionName,
                        slug: '',
                        description: '',
                        iconURL: '',
                        verified: false,
                    },
                }
            }),
        }
    }

    async getHistory(address: string, tokenId: string, { indicator = 1, size = 50 }: HubOptions<ChainId> = {}) {
        const activities = await fetchFromMagicEden<TokenActivity[]>(
            urlcat('/v2/tokens/:token_mint/activities', {
                token_mint: tokenId,
                offset: (indicator - 1) * size,
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

    async getOrders(
        _: string,
        mintAddress: string,
        side: OrderSide,
        { indicator = 1, size }: HubOptions<ChainId> = {},
    ) {
        const limit = size || 20
        const offset = indicator ? (Math.max(1, indicator) - 1) * limit : 0
        const offers = await fetchFromMagicEden<WalletOffer[]>(
            urlcat('/tokens/:token_mint/offer_received', {
                token_mint: mintAddress,
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

    async getCollections(symbol: string, { indicator = 1, size }: HubOptions<ChainId> = {}) {
        indicator = Math.max(indicator || 1, 1)
        const limit = size || 20
        const offset = (Math.max(1, indicator) - 1) * limit
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
        const hasNextPage = data.length === limit
        return {
            indicator,
            hasNextPage,
            data,
        }
    }
}
