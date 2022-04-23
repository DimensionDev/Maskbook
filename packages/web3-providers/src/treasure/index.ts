import { GraphQLClient } from 'graphql-request'
import {
    formatWeiToEther,
    ChainId,
    FungibleTokenDetailed,
    ERC721TokenDetailed,
    EthereumTokenType,
    resolveIPFSLinkFromURL,
} from '@masknet/web3-shared-evm'

import { TREASURE_ARBITRUM_GRAPHQL_URL } from './constants'
import type { Token } from './types'
import type { NonFungibleTokenAPI } from '..'

function createNFTAsset(asset: Token): NonFungibleTokenAPI.Asset {
    const image_url = asset.metadata.image ?? ''
    return {
        is_verified: false,
        is_sold: asset.listings.status === 2,
        image_url: resolveIPFSLinkFromURL(image_url),
        asset_contract: {
            name: asset.metadata.name,
            description: asset.metadata.description,
            schemaName: '',
        },
        current_price: asset.floorPrice ? formatWeiToEther(asset.floorPrice).toNumber() : null,
        current_symbol: 'MAGIC',
        owner: asset?.owner.id,
        creator: asset.collection.creator.id,
        token_id: asset.tokenId,
        token_address: asset.collection.address,
        traits: asset.metadata.attribute,
        safelist_request_status: '',
        description: asset.metadata.description,
        name: asset.name ?? asset.metadata.name,
        collection_name: asset.collection.name,
        order_payment_tokens: [] as FungibleTokenDetailed[],
        offer_payment_tokens: [] as FungibleTokenDetailed[],
        slug: '',
        top_ownerships: asset.owners,
        response_: asset,
        last_sale: null,
    }
}

function createERC721TokenFromAsset(tokenAddress: string, tokenId: string, asset?: Token): ERC721TokenDetailed {
    return {
        contractDetailed: {
            type: EthereumTokenType.ERC721,
            chainId: ChainId.Mainnet,
            address: tokenAddress,
            name: asset?.metadata.name ?? '',
            symbol: '',
        },
        info: {
            name: asset?.metadata.name ?? '',
            description: asset?.metadata.description ?? '',
            mediaUrl: asset?.metadata.image ?? '',
            owner: asset?.owner.id,
        },
        tokenId: tokenId,
    }
}

export class TreasureAPI {
    private client
    constructor() {
        this.client = new GraphQLClient(TREASURE_ARBITRUM_GRAPHQL_URL)
    }
}
