import { GraphQLClient } from 'graphql-request'
import { first } from 'lodash-unified'
import { formatWeiToEther, ChainId, resolveIPFSLinkFromURL, SchemaType } from '@masknet/web3-shared-evm'

import type { ZoraToken, ZoraHistory, ZoraBid, ZoraAsk } from './types'
import {
    CurrencyType,
    FungibleToken,
    NonFungibleAsset,
    NonFungibleToken,
    NonFungibleTokenEvent,
    NonFungibleTokenOrder,
    OrderSide,
} from '@masknet/web3-shared-base'
import { ZORA_MAINNET_GRAPHQL_URL } from './constants'
import { getAsksQuery, getAssetQuery, getBidsQuery, getTokenHistoryQuery } from './queries'

function createNFTAsset(asset: ZoraToken): NonFungibleAsset<ChainId, SchemaType> {
    const image_url =
        asset.metadata.json.image ?? asset.metadata.json.animation_url ?? asset.metadata.json.image_url ?? ''
    const animation_url = asset.metadata.json.image ?? asset.metadata.json.animation_url ?? ''
    return {
        auction: {
            isAuction: asset.currentAuction !== null,
            endAt: asset.currentAuction ? new Date(asset.currentAuction.expiresAt).getTime() : undefined,
        },

        price: asset.v3Ask
            ? {
                  [CurrencyType.USD]: formatWeiToEther(asset.v3Ask.askPrice).toString(),
              }
            : undefined,

        owner: asset.owner
            ? {
                  address: asset.owner,
                  avatarURL: '',
                  nickname: asset.owner,
                  link: `https://zora.co/${asset?.owner}`,
              }
            : undefined,
        creator: asset.metadata.json.created_by
            ? {
                  address: asset.metadata.json.created_by,
                  avatarURL: '',
                  nickname: asset.metadata.json.created_by,
                  link: `https://zora.co/${asset?.metadata.json.created_by}`,
              }
            : undefined,

        tokenId: asset.tokenId,
        contract: {
            chainId: ChainId.Mainnet,
            schema: SchemaType.ERC721,
            symbol: asset.symbol,
            name: asset.name ?? asset.metadata.json.name,
            address: asset.address,
            owner: asset.owner,
        },
        metadata: {
            chainId: ChainId.Mainnet,
            name: asset.name ?? asset.metadata.json.name,
            symbol: asset.symbol,
            description: asset.metadata.json.description,
            imageURL: resolveIPFSLinkFromURL(image_url),
            mediaURL: resolveIPFSLinkFromURL(animation_url),
        },

        traits: asset.metadata.json.attributes,
        orders: [] as NonFungibleTokenOrder<ChainId, SchemaType>[],
        events: [] as NonFungibleTokenEvent<ChainId, SchemaType>[],
    } as NonFungibleAsset<ChainId, SchemaType>
}

function createERC721TokenFromAsset(
    tokenAddress: string,
    tokenId: string,
    asset?: ZoraToken,
): NonFungibleToken<ChainId, SchemaType> {
    return {
        contract: {
            schema: SchemaType.ERC721,
            chainId: ChainId.Mainnet,
            address: tokenAddress,
            name: asset?.tokenContract.name ?? '',
            symbol: asset?.symbol ?? 'ETH',
            owner: asset?.owner,
        },
        metadata: {
            name: asset?.metadata.json.name ?? '',
            description: asset?.metadata.json.description ?? '',
            mediaURL: asset?.metadata.json.animation_url,
            imageURL: asset?.metadata.json.image_url ?? '',
            chainId: ChainId.Mainnet,
            symbol: asset?.symbol ?? 'ETH',
        },
        tokenId,
    } as NonFungibleToken<ChainId, SchemaType>
}

export class ZoraAPI {
    private client
    constructor() {
        this.client = new GraphQLClient(ZORA_MAINNET_GRAPHQL_URL)
    }
    async getAsset(address: string, tokenId: string) {
        const variables = {
            address,
            tokenId,
        }
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
    async getHistory(address: string, tokenId: string): Promise<NonFungibleTokenEvent<ChainId, SchemaType>[]> {
        const variables = {
            address,
            tokenId,
        }
        const nftEventHistory = await this.client.request(getTokenHistoryQuery, variables)
        const history: NonFungibleTokenEvent<ChainId, SchemaType>[] = nftEventHistory.Token[0].transferEvents.map(
            (event: ZoraHistory): NonFungibleTokenEvent<ChainId, SchemaType> | undefined => {
                if (event.transaction.mediaMints?.length !== 0) {
                    const mint = first(event.transaction.mediaMints)
                    return {
                        id: mint?.id || '',
                        type: 'mint',
                        chainId: ChainId.Mainnet,
                        asset_permalink: '',
                        timestamp: new Date(`${event.blockTimestamp}Z`).getTime(),
                        quantity: 0,
                        from: {
                            nickname: '',
                            address: mint?.address,
                            avatarURL: '',
                            link: `https://zora.co/${mint?.address}`,
                        },
                        to: {
                            nickname: '',
                            address: mint?.creator,
                            avatarURL: '',
                            link: `https://zora.co/${mint?.creator}`,
                        },
                        paymentToken: {
                            chainId: ChainId.Mainnet,
                            schema: SchemaType.ERC721,
                            name: 'Ether',
                            symbol: 'ETH',
                            decimals: 18,
                            address: '0x0000000000000000000000000000000000000000',
                        } as FungibleToken<ChainId, SchemaType>,

                        price: {
                            [CurrencyType.USD]: '0',
                        },
                    }
                }
                if (event.transaction.auctionCreatedEvents?.length !== 0) {
                    const list = first(event.transaction.auctionCreatedEvents)
                    return {
                        id: list?.id || '',
                        type: 'List',
                        chainId: ChainId.Mainnet,
                        timestamp: new Date(`${event.blockTimestamp}Z`).getTime(),
                        asset_permalink: '',
                        quantity: list?.reservePrice ? formatWeiToEther(list?.reservePrice).toNumber() : 0,
                        from: {
                            nickname: list?.tokenOwner,
                            address: list?.tokenOwner,
                            avatarURL: '',
                            link: `https://zora.co/${list?.tokenOwner}`,
                        },
                        to: {
                            nickname: '',
                            address: '',
                            avatarURL: '',
                            link: '',
                        },
                        paymentToken: {
                            name: 'Ether',
                            symbol: 'ETH',
                            decimals: 18,
                            address: list?.auctionCurrency || '',
                            chainId: ChainId.Mainnet,
                            schema: SchemaType.ERC721,
                        } as FungibleToken<ChainId, SchemaType>,
                        price: {
                            [CurrencyType.USD]: '1',
                        },
                    }
                }
                if (event.transaction.marketBidEvents?.length !== 0) {
                    const bid = first(event.transaction.marketBidEvents)
                    return {
                        id: bid?.id || '',
                        type: 'Bid',
                        asset_permalink: '',
                        chainId: ChainId.Mainnet,
                        timestamp: new Date(`${event.blockTimestamp}Z`).getTime(),
                        quantity: bid?.amount ? formatWeiToEther(bid?.amount).toNumber() : 0,
                        paymentToken: {
                            name: 'Ether',
                            symbol: 'ETH',
                            decimals: 18,
                            address: bid?.currencyAddress || '',
                            chainId: ChainId.Mainnet,
                            schema: SchemaType.ERC721,
                        } as FungibleToken<ChainId, SchemaType>,
                        price: {
                            [CurrencyType.USD]: '1',
                        },
                        from: {
                            nickname: bid?.bidder,
                            address: bid?.bidder,
                            avatarURL: '',
                            link: `https://zora.co/${bid?.bidder}`,
                        },
                        to: {
                            nickname: bid?.recipient,
                            address: bid?.recipient,
                            avatarURL: '',
                            link: `https://zora.co/${bid?.recipient}`,
                        },
                    }
                }
                if (event.transaction.auctionEndedEvents?.length !== 0) {
                    const buy = first(event.transaction.auctionEndedEvents)
                    return {
                        id: buy?.id || '',
                        type: 'Buy',
                        chainId: ChainId.Mainnet,
                        asset_permalink: '',
                        timestamp: new Date(`${event.blockTimestamp}Z`).getTime(),
                        quantity: buy?.auction.lastBidAmount
                            ? formatWeiToEther(buy?.auction.lastBidAmount).toNumber()
                            : 0,
                        paymentToken: {
                            name: 'Ether',
                            symbol: 'ETH',
                            decimals: 18,
                            address: buy?.auction.auctionCurrency || '',
                            chainId: ChainId.Mainnet,
                            schema: SchemaType.ERC721,
                        } as FungibleToken<ChainId, SchemaType>,
                        price: {
                            [CurrencyType.USD]: '1',
                        },
                        from: {
                            nickname: buy?.tokenOwner,
                            address: buy?.tokenOwner,
                            avatarURL: '',
                            link: `https://zora.co/${buy?.tokenOwner}`,
                        },
                        to: {
                            nickname: buy?.winner,
                            address: buy?.winner,
                            avatarURL: '',
                            link: `https://zora.co/${buy?.winner}`,
                        },
                    }
                }
                return
            },
        )
        return history.filter((event) => event !== undefined)
    }
    async getOffers(tokenAddress: string, tokenId: string): Promise<NonFungibleTokenOrder<ChainId, SchemaType>[]> {
        const variables = {
            tokenAddress,
            tokenId,
        }
        const nftBids = await this.client.request(getBidsQuery, variables)
        const offers: NonFungibleTokenOrder<ChainId, SchemaType>[] = nftBids.Token[0].transferEvents.map(
            (event: ZoraBid): NonFungibleTokenOrder<ChainId, SchemaType> | undefined => {
                if (event.transaction.marketBidEvents?.length !== 0) {
                    const bid = first(event.transaction.marketBidEvents)
                    return {
                        id: bid?.id ?? '',
                        chainId: ChainId.Mainnet,
                        asset_permalink: '',
                        quantity: 1,
                        hash: bid?.transactionHash,
                        side: OrderSide.Buy,
                        maker: {
                            nickname: bid?.recipient || '',
                            address: bid?.recipient || '',
                            avatarURL: '',
                            link: `https://zora.co/${bid?.recipient}`,
                        },
                        createdAt: new Date(`${bid?.blockTimestamp}Z`).getTime(),
                        expiredAt: 0,
                        price: {
                            [CurrencyType.USD]: bid?.amount,
                        },

                        paymentToken: {
                            name: 'Ether',
                            symbol: 'ETH',
                            decimals: 18,
                            address: bid?.currencyAddress || '',
                            chainId: ChainId.Mainnet,
                            schema: SchemaType.ERC721,
                        } as FungibleToken<ChainId, SchemaType>,
                    }
                }
                return
            },
        )
        return offers.filter((offer) => offer !== undefined)
    }
    async getListings(tokenAddress: string, tokenId: string): Promise<NonFungibleTokenOrder<ChainId, SchemaType>[]> {
        const variables = {
            tokenAddress,
            tokenId,
        }
        const nftAsks = await this.client.request(getAsksQuery, variables)
        const orders: NonFungibleTokenOrder<ChainId, SchemaType>[] = nftAsks.Token[0].transferEvents.map(
            (event: ZoraAsk): NonFungibleTokenOrder<ChainId, SchemaType> | undefined => {
                if (event.transaction.auctionCreatedEvents?.length !== 0) {
                    const ask = first(event.transaction.auctionCreatedEvents)
                    return {
                        id: ask?.id ?? '',
                        chainId: ChainId.Mainnet,
                        asset_permalink: '',
                        quantity: 1,
                        hash: ask?.transactionHash,
                        side: OrderSide.Sell,
                        createdAt: new Date(`${ask?.blockTimestamp}Z`).getTime(),
                        expiredAt: 0,

                        price: {
                            [CurrencyType.USD]: formatWeiToEther(ask?.reservePrice || 0).toString(),
                        },

                        paymentToken: {
                            name: 'Ether',
                            symbol: 'ETH',
                            decimals: 18,
                            address: ask?.auctionCurrency || '',
                            chainId: ChainId.Mainnet,
                            schema: SchemaType.ERC721,
                        } as FungibleToken<ChainId, SchemaType>,

                        maker: {
                            nickname: ask?.tokenOwner || '',
                            address: ask?.tokenOwner || '',
                            avatarURL: '',
                            link: `https://zora.co/${ask?.tokenOwner}`,
                        },
                    }
                }
                return
            },
        )
        return orders.filter((order) => order !== undefined)
    }
    async getOrders(tokenAddress: string, tokenId: string, side: OrderSide) {
        switch (side) {
            case OrderSide.Buy:
                return this.getOffers(tokenAddress, tokenId)
            case OrderSide.Sell:
                return this.getListings(tokenAddress, tokenId)
            default:
                return []
        }
    }
}
