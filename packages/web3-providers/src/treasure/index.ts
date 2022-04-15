import { GraphQLClient } from 'graphql-request'
import {
    formatWeiToEther,
    ChainId,
    FungibleTokenDetailed,
    ERC721TokenDetailed,
    EthereumTokenType,
    resolveIPFSLinkFromURL,
} from '@masknet/web3-shared-evm'

import { NonFungibleTokenAPI } from '..'
import type { TreasureToken, Collections } from './types'
import { TREASURE_ARBITRUM_GRAPHQL_URL } from './constants'

function createNFTAsset(asset: TreasureToken, chainId: ChainId): NonFungibleTokenAPI.Asset {
    const image_url =
        asset.metadata.json.image ?? asset.metadata.json.animation_url ?? asset.metadata.json.image_url ?? ''
    const animation_url = asset.metadata.json.image ?? asset.metadata.json.animation_url ?? ''
    return {
        is_verified: false,
        is_auction: asset.currentAuction !== null,
        image_url: resolveIPFSLinkFromURL(image_url),
        asset_contract: {
            name: asset.tokenContract.name,
            description: '',
            schemaName: '',
        },
        current_price: asset.v3Ask ? formatWeiToEther(asset.v3Ask.askPrice).toNumber() : null,
        current_symbol: asset.symbol ?? 'ETH',
        owner: asset.owner
            ? {
                  address: asset.owner,
                  profile_img_url: '',
                  user: { username: asset.owner },
                  link: `https://zora.co/${asset?.owner}`,
              }
            : null,
        creator: asset.metadata.json.created_by
            ? {
                  address: asset.metadata.json.created_by,
                  profile_img_url: '',
                  user: { username: asset.metadata.json.created_by },
                  link: `https://zora.co/${asset?.metadata.json.created_by}`,
              }
            : null,
        token_id: asset.tokenId,
        token_address: asset.address,
        traits: asset.metadata.json.attributes,
        safelist_request_status: '',
        description: asset.metadata.json.description,
        name: asset.name ?? asset.metadata.json.name,
        collection_name: '',
        animation_url: resolveIPFSLinkFromURL(animation_url),
        end_time: asset.currentAuction ? new Date(asset.currentAuction.expiresAt) : null,
        order_payment_tokens: [] as FungibleTokenDetailed[],
        offer_payment_tokens: [] as FungibleTokenDetailed[],
        slug: '',
        top_ownerships: asset.owner
            ? [
                  {
                      owner: {
                          address: asset.owner,
                          profile_img_url: '',
                          user: { username: asset.owner },
                          link: `https://zora.co/${asset.owner}`,
                      },
                  },
              ]
            : [],
        response_: asset,
        last_sale: null,
    }
}

function createERC721TokenFromAsset(tokenAddress: string, tokenId: string, asset?: TreasureToken): ERC721TokenDetailed {
    return {
        contractDetailed: {
            type: EthereumTokenType.ERC721,
            chainId: ChainId.Mainnet,
            address: tokenAddress,
            name: asset?.tokenContract.name ?? '',
            symbol: '',
        },
        info: {
            name: asset?.metadata.json.name ?? '',
            description: asset?.metadata.json.description ?? '',
            mediaUrl: asset?.metadata.json.animation_url ?? asset?.metadata.json.image_url ?? '',
            owner: asset?.owner,
        },
        tokenId: tokenId,
    }
}

export class TreasureAPI {
    private client
    constructor() {
        this.client = new GraphQLClient(TREASURE_ARBITRUM_GRAPHQL_URL)
    }

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

        return first(
            this.collectionsCache.collections
                .filter((e) => e.name.toLowerCase().replace(' ', '-') === collectionName)
                .map((e) => e.id),
        )
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
