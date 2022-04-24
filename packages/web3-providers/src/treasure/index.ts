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
import type { Listing, Token } from './types'
import { NonFungibleTokenAPI } from '..'
import { getAssetQuery, getTokenDetails, getTokenHistoryQuery } from './queries'
import { first } from 'lodash-unified'

function createNFTAsset(asset: Token): NonFungibleTokenAPI.Asset {
    const image_url = asset.metadata.image ?? ''
    return {
        is_auction: false,
        is_verified: false,
        image_url: resolveIPFSLinkFromURL(image_url),
        asset_contract: {
            name: asset.metadata.name,
            description: asset.metadata.description,
            schemaName: '',
        },
        current_price: asset.floorPrice ? formatWeiToEther(asset.floorPrice).toNumber() : null,
        current_symbol: 'MAGIC',
        owner: asset?.owner,
        creator: asset.collection.creator.id
            ? {
                  address: asset.collection.creator.id,
                  profile_img_url: '',
                  user: { username: asset.collection.creator.id },
                  link: '',
              }
            : null,
        token_id: asset.tokenId,
        token_address: asset.collection.address,
        traits: asset.metadata.attribute?.map((e: any) => {
            return {
                trait_type: e.attribute.name,
                value: e.attribute.name === 'IQ' ? Number(e.attribute.value) / 1e18 : e.attribute.value,
            }
        }),
        safelist_request_status: '',
        description: asset.metadata.description,
        name: asset.name ?? asset.metadata.name,
        collection_name: asset.collection.name,
        order_payment_tokens: [] as FungibleTokenDetailed[],
        offer_payment_tokens: [] as FungibleTokenDetailed[],
        slug: '',
        top_ownerships: asset.owner.id
            ? [
                  {
                      owner: {
                          address: asset.owner.id,
                          profile_img_url: '',
                          user: { username: asset.owner.id },
                          link: '',
                      },
                  },
              ]
            : [],

        end_time: null,
        response_: asset,
        last_sale: null,
        animation_url: '',
    }
}

function createERC721TokenFromAsset(tokenAddress: string, tokenId: string, asset?: Token): ERC721TokenDetailed {
    return {
        contractDetailed: {
            type: EthereumTokenType.ERC721,
            chainId: ChainId.Arbitrum,
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

    async getAsset(address: string, tokenId: string) {
        const variables = { address, tokenId }
        const assetData = await this.client.request(getAssetQuery, variables)
        if (!assetData) return
        return createNFTAsset(assetData.Token[0])
    }

    async getToken(address: string, tokenId: string) {
        const variables = {
            address,
            tokenId,
        }
        const asset = await this.client.request(getAssetQuery, variables)
        if (!asset) return
        return createERC721TokenFromAsset(address, tokenId, asset.Token[0])
    }

    async getHistory(address: string, tokenId: string): Promise<NonFungibleTokenAPI.History[]> {
        const variables = {
            address,
            tokenId,
        }

        const treasureEventHistory = await this.client.request(getTokenHistoryQuery, variables)

        const history: NonFungibleTokenAPI.History[] = treasureEventHistory.Token[0].transferEvents.map(
            (event: Listing): NonFungibleTokenAPI.History | undefined => {
                if (event.buyer.id.length !== 0) {
                    const buyer = first(event.buyer.id)
                    return {
                        id: buyer || '',
                        eventType: 'Buy',
                        timestamp: new Date(`${event.blockTimestamp}Z`).getTime(),
                        price: {
                            quantity: event.quantity,
                            price: event.collection.floorPrice,
                            paymentToken: {
                                name: 'Magic',
                                symbol: 'MAGIC',
                                decimals: 18,
                                address: '0x539bdE0d7Dbd336b79148AA742883198BBF60342',
                            },
                        },
                        accountPair: {
                            from: {
                                username: event.token.owner.id,
                                address: event.token.owner.id,
                                imageUrl: '',
                                link: event.transactionLink,
                            },
                            to: {
                                username: event.token.owner.id,
                                address: event.token.owner.id,
                                imageUrl: '',
                                link: '',
                            },
                        },
                    }
                }
                return
            },
        )

        return history.filter((event) => event !== undefined)
    }

    async getOffers(tokenAddress: string, tokenId: string): Promise<NonFungibleTokenAPI.AssetOrder[]> {
        const variables = {
            tokenAddress,
            tokenId,
        }
        const nftOffers = await this.client.request(getTokenDetails, variables)

        const offers: NonFungibleTokenAPI.AssetOrder[] = nftOffers.Token[0].transferEvents.map(
            (event: Listing): NonFungibleTokenAPI.AssetOrder | undefined => {
                if (event.status !== 0 && event.status === 1) {
                    return {
                        created_time: new Date(`${event.blockTimestamp}Z`).getTime().toString(),
                        current_price: event.pricePerItem,
                        payment_token: 'MAGIC' || '',
                        payment_token_contract: {
                            name: 'MAGIC',
                            symbol: 'MAGIC',
                            decimals: 18,
                            address: '0x539bdE0d7Dbd336b79148AA742883198BBF60342',
                        },
                        listing_time: 0,
                        side: NonFungibleTokenAPI.OrderSide.Buy,
                        quantity: '1',
                        expiration_time: 0,
                        order_hash: event.transactionLink || '',
                        approved_on_chain: false,
                        maker_account: {
                            user: { username: event.buyer.address || '' },
                            address: event.buyer.address || '',
                            profile_img_url: '',
                            link: '',
                        },
                    }
                }
                return
            },
        )

        return offers.filter((offer) => offer !== undefined)
    }

    async getListings(tokenAddress: string, tokenId: string): Promise<NonFungibleTokenAPI.AssetOrder[]> {
        const variables = {
            tokenAddress,
            tokenId,
        }

        const listingTreasure = await this.client.request(getTokenDetails, variables)

        const orders: NonFungibleTokenAPI.AssetOrder[] = listingTreasure.Token[0].transferEvents.map(
            (event: Listing): NonFungibleTokenAPI.AssetOrder | undefined => {
                if (event.status !== 1) {
                    return {
                        created_time: new Date(`${event.blockTimestamp}Z`).getTime().toString(),
                        approved_on_chain: false,
                        current_price: formatWeiToEther(event.pricePerItem || 0).toString(),
                        payment_token: 'MAGIC',
                        payment_token_contract: {
                            name: 'Magic',
                            symbol: 'MAGIC',
                            decimals: 18,
                            address: '0x539bdE0d7Dbd336b79148AA742883198BBF60342',
                        },
                        listing_time: 0,
                        side: NonFungibleTokenAPI.OrderSide.Sell,
                        quantity: '1',
                        expiration_time: 0,
                        order_hash: event.transactionLink || '',
                        maker_account: {
                            user: { username: event.seller.address || '' },
                            address: event.seller.address || '',
                            profile_img_url: '',
                            link: '',
                        },
                    }
                }
                return
            },
        )

        return orders.filter((order) => order !== undefined)
    }

    async getOrders(tokenAddress: string, tokenId: string, side: NonFungibleTokenAPI.OrderSide) {
        switch (side) {
            case NonFungibleTokenAPI.OrderSide.Buy:
                return this.getOffers(tokenAddress, tokenId)
            case NonFungibleTokenAPI.OrderSide.Sell:
                return this.getListings(tokenAddress, tokenId)
            default:
                return []
        }
    }
}
