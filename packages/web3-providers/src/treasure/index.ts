import { ChainId, createERC721Token, createERC721ContractDetailed } from '@masknet/web3-shared-evm'
import { NonFungibleTokenAPI } from '../types'
import {
    IPFS_GATEWAY,
    QUERY_COLLECTIONS,
    QUERY_TOKEN_DETAILS,
    TREASURE_API_URL,
    TREASURE_API_URL_NEXT,
    TREASURE_API_URL_BRIDGE_WORLD,
    QUERY_TOKEN_ALT,
    QUERY_TOKEN_BRIDGEWORLD,
} from './constants'
import { GraphQLClient } from 'graphql-request'
import type { RequestDocument, Variables } from 'graphql-request/dist/types'
import type { Collections, TreasureTokenDetail, TreasureTokenWithMetadata, TreasureAttribute } from './types'

const ENDPOINT = new GraphQLClient(TREASURE_API_URL)
const ENDPOINT_NEXT = new GraphQLClient(TREASURE_API_URL_NEXT)
const ENDPOINT_BRIDGEWORLD = new GraphQLClient(TREASURE_API_URL_BRIDGE_WORLD)

async function fetchFromTreasure<T>(
    query: RequestDocument,
    variables?: Variables | undefined,
    client: GraphQLClient = ENDPOINT,
) {
    try {
        const response = await client.request(query, variables)
        return response as Promise<T>
    } catch {
        return
    }
}

async function fetchCollections() {
    return fetchFromTreasure<Collections>(QUERY_COLLECTIONS, undefined, ENDPOINT_NEXT)
}

async function fetchTokenDetail(address: string, tokenId: string) {
    let response = await fetchFromTreasure<TreasureTokenDetail>(QUERY_TOKEN_DETAILS, {
        collectionId: address,
        tokenId,
    })

    if (!response || !response.collection) {
        // The first API doesn't have the information of this token
        // Try the so-called marketplace-next API

        const detail = await fetchFromTreasure<TreasureTokenDetail>(
            QUERY_TOKEN_ALT,
            {
                collectionId: address,
                tokenId,
            },
            ENDPOINT_NEXT,
        )
        if (!detail) return

        response = detail
    }

    if (!response.collection.tokens[0].metadata || !response.collection.tokens[0].metadata.attributes) {
        const metadata = await fetchFromTreasure<TreasureTokenWithMetadata>(
            QUERY_TOKEN_BRIDGEWORLD,
            {
                id: response.collection.tokens[0].id,
            },
            ENDPOINT_BRIDGEWORLD,
        )
        if (!metadata) return
        const attributes: TreasureAttribute[] = Array.from(
            Object.entries(metadata.token.metadata!),
            ([name, value]) => ({
                attribute: { name, value: value ?? 'None' },
            }),
        )

        response.collection.tokens[0].metadata = {
            ...metadata.token,
            attributes,
        }
    }

    return response
}

function makeTreasureLink(collectionId: string, tokenId?: string) {
    if (tokenId !== null) {
        return `https://marketplace.treasure.lol/collection/${collectionId}/${tokenId}`
    } else {
        return `https://marketplace.treasure.lol/collection/${collectionId}/`
    }
}

function resolveImageUrl(url: string): string {
    if (url.startsWith('ipfs://')) {
        return IPFS_GATEWAY + url.replace('ipfs://', '')
    }
    return url
}

function createNFTAsset(asset: TreasureTokenDetail, chainId: ChainId): NonFungibleTokenAPI.Asset {
    const collection = asset.collection
    const token = asset.collection.tokens[0]
    return {
        is_verified: false,
        collection: undefined,
        is_auction: false,
        image_url: resolveImageUrl(token.metadata.image),
        asset_contract: {
            name: collection.name,
            description: '',
            schemaName: collection.standard,
        },
        current_symbol: 'MAGIC',
        current_price: token.floorPrice === null ? null : token.floorPrice / 1e18,
        token_id: token.tokenId,
        token_address: collection.id.split('-')[0],
        traits:
            token.metadata.attributes?.map((e: any) => {
                return {
                    trait_type: e.attribute.name,
                    value: e.attribute.name === 'IQ' ? Number(e.attribute.value) / 1e18 : e.attribute.value,
                }
            }) || [],
        safelist_request_status: '',
        description: token.metadata.description,
        name: token.metadata.name,
        collection_name: collection.name,
        order_payment_tokens: [],
        offer_payment_tokens: [],
        slug: null,
        top_ownerships: [],
        last_sale: null,
        owner: token.owner
            ? {
                  address: token.owner.id,
                  // There isn't a page for an user. Use the page for the token instead
                  link: makeTreasureLink(asset.collection.id, asset.collection.tokens[0].tokenId),
                  user: { username: token.owner.id },
              }
            : null,
        end_time: null,
        response_: null,
        creator: {
            address: '',
            user: {
                username: collection.creator?.name || '',
            },
            link: 'https://www.treasure.lol/', // All NFT are created by Treasure DAO
        },
    }
}

function createNFTHistory(asset: TreasureTokenDetail): NonFungibleTokenAPI.History[] {
    return asset.collection.tokens[0].listings.map((e) => {
        return {
            id: '',
            accountPair: {
                from: {
                    address: e.seller.id,
                    link: makeTreasureLink(asset.collection.id, asset.collection.tokens[0].tokenId),
                },
                to: e.buyer
                    ? {
                          address: e.buyer.id,
                          link: makeTreasureLink(asset.collection.id, asset.collection.tokens[0].tokenId),
                      }
                    : undefined,
            },
            price: {
                quantity: Number(e.pricePerItem) / 1e18 + ' $MAGIC',
                price: Number(e.pricePerItem) / 1e18 + ' $MAGIC',
            },
            eventType: e.status,
            timestamp: Number(e.blockTimestamp) * 1000,
        }
    })
}

export class TreasureAPI implements NonFungibleTokenAPI.Provider {
    // Collections are only a few and hardly change
    collectionsCache: Collections | null = null

    // Resolve a collection name to the corresponding contract address
    async resolveCollectionNameToAddress(collectionName: string): Promise<string | undefined> {
        // To map a collection name to a contract address, the collection list must be retrieved
        if (!this.collectionsCache) {
            const response = await fetchCollections()
            if (response !== undefined) this.collectionsCache = response
        }

        if (!this.collectionsCache) return

        return first(this.collectionsCache.collections
            .filter((e) => e.name.toLowerCase().replace(' ', '-') === collectionName)
            .map((e) => e.id))
    }

    // Resolve a collection name or a contract address to the Treasure collection ID
    async resolveCollectionNameOrAddress(nameOrAddress: string) {
        // Because captured URL part can represent a collection name or its contract address
        // A test must be made
        if (nameOrAddress.startsWith('0x')) {
            // It's an address. Return as it is
            return nameOrAddress
        } else {
            return this.resolveCollectionNameToAddress(nameOrAddress)
        }
    }

    async getAsset(nameOrAddress: string, tokenId: string, { chainId = ChainId.Arbitrum }: { chainId?: ChainId } = {}) {
        const address = await this.resolveCollectionNameOrAddress(nameOrAddress)
        if (!address) return
        const response = await fetchTokenDetail(address, tokenId)
        if (!response) return
        return createNFTAsset(response, chainId)
    }

    async getToken(nameOrAddress: string, tokenId: string) {
        const address = await this.resolveCollectionNameOrAddress(nameOrAddress)
        if (!address) return
        return createERC721Token(createERC721ContractDetailed(ChainId.Arbitrum, address), {}, tokenId)
    }

    async getTokens(from: string, opts: NonFungibleTokenAPI.Options) {
        return {
            data: [],
            hasNextPage: false,
        }
    }

    async getHistory(
        nameOrAddress: string,
        tokenId: string,
        { chainId = ChainId.Arbitrum, page, size }: NonFungibleTokenAPI.Options = {},
    ) {
        const address = await this.resolveCollectionNameOrAddress(nameOrAddress)
        if (!address) return []
        const response = await fetchTokenDetail(address, tokenId)
        if (!response) return []
        return createNFTHistory(response)
    }

    async getOffers(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet }: NonFungibleTokenAPI.Options = {},
    ): Promise<NonFungibleTokenAPI.AssetOrder[]> {
        return []
    }

    async getListings(
        address: string,
        tokenId: string,
        { chainId = ChainId.Arbitrum }: NonFungibleTokenAPI.Options = {},
    ): Promise<NonFungibleTokenAPI.AssetOrder[]> {
        return []
    }

    async getOrders(
        address: string,
        tokenId: string,
        side: NonFungibleTokenAPI.OrderSide,
        opts: NonFungibleTokenAPI.Options = {},
    ) {
        switch (side) {
            case NonFungibleTokenAPI.OrderSide.Buy:
                return this.getOffers(address, tokenId, opts)
            case NonFungibleTokenAPI.OrderSide.Sell:
                return this.getListings(address, tokenId, opts)
            default:
                return []
        }
    }
}

export function getTreasureNFTList(
    apiKey: string,
    address: string,
    page?: number,
    size?: number,
    pageInfo?: { [key in string]: unknown },
) {
    const treasure = new TreasureAPI()
    return treasure.getTokens(address, { page, size, pageInfo })
}
