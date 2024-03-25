import urlcat from 'urlcat'
import { createIndicator, createNextIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base'
import {
    type NonFungibleToken,
    type NonFungibleTokenContract,
    ActivityType,
    type OrderSide,
    TokenType,
    resolveIPFS_URL,
    SourceType,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType, isValidChainId } from '@masknet/web3-shared-solana'
import { MAGIC_EDEN_API_URL } from './constants.js'
import type {
    Auction,
    MagicEdenCollection as Collection,
    MagicEdenNFT,
    MagicEdenToken,
    TokenActivity,
    WalletOffer,
} from './types.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { getAssetFullName } from '../helpers/getAssetFullName.js'
import type { BaseHubOptions, NonFungibleTokenAPI } from '../entry-types.js'

async function fetchFromMagicEden<T>(chainId: ChainId, path: string) {
    if (chainId !== ChainId.Mainnet) return

    const url = urlcat(MAGIC_EDEN_API_URL, path)
    return fetchJSON<T>(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    })
}

function createNFTToken(
    chainId: ChainId,
    token: MagicEdenToken,
    collection: Collection,
): NonFungibleToken<ChainId, SchemaType> {
    return {
        id: token.mintAddress,
        chainId,
        ownerId: token.owner,
        type: TokenType.NonFungible,
        schema: SchemaType.NonFungible,
        tokenId: '',
        address: token.mintAddress,
        metadata: {
            chainId,
            name: getAssetFullName(token.mintAddress, collection.name, token.name, ''),
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
        source: SourceType.MagicEden,
    }
}

class MagicEdenAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getToken(address: string, tokenMint: string, { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return
        const token = await fetchFromMagicEden<MagicEdenToken>(
            chainId,
            urlcat('/v2/tokens/:mint_address', { mint_address: tokenMint }),
        )
        if (!token) return
        const collection = await fetchFromMagicEden<Collection>(
            chainId,
            urlcat('/collections/:symbol', { symbol: token.collection }),
        )
        if (!collection) return
        return createNFTToken(chainId, token, collection)
    }

    async getAsset(address: string, tokenMint: string, { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return
        const [token, auction, nft] = await Promise.all([
            this.getToken(address, tokenMint, {
                chainId,
            }),
            fetchFromMagicEden<Auction>(
                chainId,
                urlcat('/auctions/token-mint/:mint_address', { mint_address: tokenMint }),
            ),
            fetchFromMagicEden<MagicEdenNFT>(
                chainId,
                urlcat('/rpc/getNFTByMintAddress/:mint_address', { mint_address: tokenMint }),
            ),
        ])
        if (!token) return

        return {
            ...token,
            link: urlcat('https://magiceden.io/item-details/:mint_address', {
                mint_address: tokenMint,
            }),
            creator:
                nft?.creators.length ?
                    {
                        address: nft.creators[0].address,
                    }
                :   undefined,
            owner: {
                address: nft?.owner,
            },
            traits: auction?.attributes.map((x) => ({
                type: x.trait_type,
                value: x.value,
            })),
            source: SourceType.MagicEden,
        }
    }

    async getAssets(owner: string, { chainId = ChainId.Mainnet, indicator }: BaseHubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        if ((indicator?.index ?? 0) > 0) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const response = await fetchFromMagicEden<{
            results: MagicEdenNFT[]
        }>(
            chainId,
            urlcat('/rpc/getNFTsByOwner/:owner', {
                owner,
            }),
        )
        const data = response?.results.map((token) => {
            return {
                id: token.mintAddress,
                chainId,
                link: urlcat('https://magiceden.io/item-details/:mint_address', {
                    mint_address: token.mintAddress,
                }),
                type: TokenType.NonFungible,
                schema: SchemaType.NonFungible,
                tokenId: '',
                address: token.mintAddress,
                metadata: {
                    chainId,
                    name: getAssetFullName(token.mintAddress, token.collectionName, token.title, ''),
                    symbol: '',
                    imageURL: resolveIPFS_URL(token.img),
                    mediaURL: resolveIPFS_URL(token.img),
                    owner: token.owner,
                },
                contract: {
                    chainId,
                    schema: SchemaType.NonFungible,
                    address: token.mintAddress,
                    name: token.collectionName,
                    symbol: '',
                },
                collection: {
                    chainId,
                    name: token.collectionName ?? token.collectionTitle,
                    slug: '',
                    description: '',
                    iconURL: '',
                    verified: false,
                },
                source: SourceType.MagicEden,
            }
        })
        return createPageable(data ?? EMPTY_LIST, createIndicator(indicator))
    }

    async getContract(tokenMint: string, { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return
        const token = await fetchFromMagicEden<MagicEdenToken>(
            chainId,
            urlcat('/v2/tokens/:mint_address', { mint_address: tokenMint }),
        )
        if (!token) return
        const collection = await fetchFromMagicEden<Collection>(
            chainId,
            urlcat('/collections/:symbol', { symbol: token.collection }),
        )
        if (!collection) return
        return createNFTCollection(collection)
    }

    async getEvents(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, indicator, size = 50 }: BaseHubOptions<ChainId> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const activities = await fetchFromMagicEden<TokenActivity[]>(
            chainId,
            urlcat('/v2/tokens/:mint_address/activities', {
                mint_address: address,
                offset: (indicator?.index ?? 0) * size,
                limit: size,
            }),
        )
        const events = activities?.map((activity) => {
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
                quantity: '1',
                type: ActivityType.Transfer,
                source: SourceType.MagicEden,
            }
        })
        return createPageable(
            events ?? EMPTY_LIST,
            createIndicator(indicator),
            events?.length === size ? createNextIndicator(indicator) : undefined,
        )
    }

    async getOrders(
        address: string,
        tokenId: string,
        side: OrderSide,
        { chainId = ChainId.Mainnet, indicator, size }: BaseHubOptions<ChainId> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const limit = size || 20
        const offers = await fetchFromMagicEden<WalletOffer[]>(
            chainId,
            urlcat('/tokens/:mint_address/offer_received', {
                mint_address: address,
                side,
                offset: (indicator?.index ?? 0) * limit,
                limit,
            }),
        )
        const orders = offers?.map((offer) => {
            return {
                id: offer.pdaAddress,
                chainId: ChainId.Mainnet,
                side,
                quantity: '1',
                // TODO's
                assetPermalink: '',
                source: SourceType.MagicEden,
            }
        })
        return createPageable(
            orders ?? EMPTY_LIST,
            createIndicator(indicator),
            orders?.length === size ? createNextIndicator(indicator) : undefined,
        )
    }

    async getCollectionsByOwner(
        symbol: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: BaseHubOptions<ChainId> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const collections = await fetchFromMagicEden<Collection[]>(
            chainId,
            urlcat('/collections/:symbol/listings', {
                symbol,
                limit: size,
                offset: (indicator?.index ?? 0) * size,
            }),
        )
        const data = collections?.map((collection) => ({
            chainId,
            name: collection.name,
            slug: collection.symbol,
            address: '',
            symbol: collection.symbol,
            iconURL: resolveIPFS_URL(collection.image),
            source: SourceType.MagicEden,
        }))

        return createPageable(
            data ?? EMPTY_LIST,
            createIndicator(indicator),
            data?.length === size ? createNextIndicator(indicator) : undefined,
        )
    }
}
export const MagicEden = new MagicEdenAPI()
