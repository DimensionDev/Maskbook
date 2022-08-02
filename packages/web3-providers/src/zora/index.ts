import { GetCollectionsByKeywordQuery, GetTokenQuery } from './queries'
import { ZORA_MAINNET_GRAPHQL_URL } from './constants'
import { GraphQLClient } from 'graphql-request'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    CurrencyType,
    HubIndicator,
    HubOptions,
    NonFungibleAsset,
    NonFungibleTokenCollection,
    NonFungibleTokenEvent,
    OrderSide,
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId, createNativeToken, formatWeiToEther, SchemaType } from '@masknet/web3-shared-evm'
import { first } from 'lodash-es'
import type { Collection, Token } from './types'
import type { NonFungibleTokenAPI } from '../types'
import { EMPTY_LIST } from '@masknet/shared-base'
import urlcat from 'urlcat'
export class ZoraAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    private client = new GraphQLClient(ZORA_MAINNET_GRAPHQL_URL)

    private createZoraLink(chainId: ChainId, address: string, tokenId: string) {
        return urlcat('https://zora.co/collections/:address/:tokenId', {
            address,
            tokenId,
        })
    }

    private createNonFungibleAssetFromToken(chainId: ChainId, token: Token): NonFungibleAsset<ChainId, SchemaType> {
        const shared = {
            chainId,
            address: token.tokenContract?.collectionAddress ?? token.collectionAddress,
            name: token.tokenContract?.name ?? token.name ?? token.collectionName ?? 'Unknown Token',
            symbol: token.tokenContract?.symbol ?? 'UNKNOWN',
            schema: SchemaType.ERC721,
        }
        return {
            id: `${token.collectionAddress}_${token.tokenId}`,
            chainId,
            type: TokenType.NonFungible,
            schema: SchemaType.ERC721,
            link: this.createZoraLink(chainId, token.collectionAddress, token.tokenId),
            address: token.collectionAddress,
            tokenId: token.tokenId,
            contract: {
                ...shared,
                owner: token.owner,
            },
            collection: {
                ...shared,
                slug: token.tokenContract?.symbol ?? 'UNKNOWN',
                description: token.tokenContract?.description ?? token.description,
            },
            metadata: {
                ...shared,
            },
            traits:
                token.attributes
                    ?.filter((x) => x.traitType && x.value)
                    .map((x) => ({
                        type: x.traitType!,
                        value: x.value!,
                    })) ?? EMPTY_LIST,
            price: token.mimtInfo?.price.usdcPrice?.decimals
                ? {
                      [CurrencyType.USD]: token.mimtInfo?.price.usdcPrice.decimals.toString(),
                  }
                : undefined,
            priceInToken: token.mimtInfo?.price.nativePrice.raw
                ? {
                      amount: token.mimtInfo?.price.nativePrice.raw,
                      token: createNativeToken(chainId),
                  }
                : undefined,
            owner: token.owner
                ? {
                      address: token.owner,
                  }
                : undefined,
            ownerId: token.owner,
        }
    }

    private createNonFungibleCollectionFromCollection(
        chainId: ChainId,
        collection: Collection,
    ): NonFungibleTokenCollection<ChainId, SchemaType> {
        return {
            chainId,
            address: collection.address,
            name: collection.name ?? 'Unknown Token',
            symbol: collection.symbol ?? 'UNKNOWN',
            slug: collection.symbol ?? 'UNKNOWN',
            description: collection.description,
            schema: SchemaType.ERC721,
        }
    }

    async getAsset(address: string, tokenId: string) {
        const token = await this.client.request<Token>(GetTokenQuery, {
            address,
            tokenId,
        })
        if (!token) return
        return this.createNonFungibleAssetFromToken(ChainId.Mainnet, token)
    }

    async getHistory(address: string, tokenId: string): Promise<NonFungibleTokenAPI.History[]> {
        const variables = {
            address,
            tokenId,
        }
        const nftEventHistory = await this.client.request(getTokenHistoryQuery, variables)
        const history: Array<NonFungibleTokenEvent<ChainId, SchemaType>> = nftEventHistory.Token[0].transferEvents.map(
            (event: ZoraHistory): NonFungibleTokenAPI.History | undefined => {
                if (event.transaction.mediaMints?.length !== 0) {
                    const mint = first(event.transaction.mediaMints)
                    return {
                        id: mint?.id || '',
                        eventType: 'mint',
                        timestamp: new Date(`${event.blockTimestamp}Z`).getTime(),
                        price: {
                            quantity: '0',
                            price: '0',
                            paymentToken: {
                                name: 'Ether',
                                symbol: 'ETH',
                                decimals: 18,
                                address: '0x0000000000000000000000000000000000000000',
                            },
                        },
                        accountPair: {
                            from: {
                                username: '',
                                address: mint?.address,
                                imageUrl: '',
                                link: `https://zora.co/${mint?.address}`,
                            },
                            to: {
                                username: '',
                                address: mint?.creator,
                                imageUrl: '',
                                link: `https://zora.co/${mint?.creator}`,
                            },
                        },
                    }
                }
                if (event.transaction.auctionCreatedEvents?.length !== 0) {
                    const list = first(event.transaction.auctionCreatedEvents)
                    return {
                        id: list?.id || '',
                        eventType: 'List',
                        timestamp: new Date(`${event.blockTimestamp}Z`).getTime(),
                        price: {
                            quantity: list?.reservePrice ? formatWeiToEther(list?.reservePrice).toFixed(4) : '',
                            price: '1',
                            paymentToken: {
                                name: 'Ether',
                                symbol: 'ETH',
                                decimals: 18,
                                address: list?.auctionCurrency || '',
                            },
                        },
                        accountPair: {
                            from: {
                                username: list?.tokenOwner,
                                address: list?.tokenOwner,
                                imageUrl: '',
                                link: `https://zora.co/${list?.tokenOwner}`,
                            },
                            to: {
                                username: '',
                                address: '',
                                imageUrl: '',
                                link: '',
                            },
                        },
                    }
                }
                if (event.transaction.marketBidEvents?.length !== 0) {
                    const bid = first(event.transaction.marketBidEvents)
                    return {
                        id: bid?.id || '',
                        eventType: 'Bid',
                        timestamp: new Date(`${event.blockTimestamp}Z`).getTime(),
                        price: {
                            quantity: bid?.amount ? formatWeiToEther(bid?.amount).toFixed(4) : '',
                            price: '1',
                            paymentToken: {
                                name: 'Ether',
                                symbol: 'ETH',
                                decimals: 18,
                                address: bid?.currencyAddress || '',
                            },
                        },
                        accountPair: {
                            from: {
                                username: bid?.bidder,
                                address: bid?.bidder,
                                imageUrl: '',
                                link: `https://zora.co/${bid?.bidder}`,
                            },
                            to: {
                                username: bid?.recipient,
                                address: bid?.recipient,
                                imageUrl: '',
                                link: `https://zora.co/${bid?.recipient}`,
                            },
                        },
                    }
                }
                if (event.transaction.auctionEndedEvents?.length !== 0) {
                    const buy = first(event.transaction.auctionEndedEvents)
                    return {
                        id: buy?.id || '',
                        eventType: 'Buy',
                        timestamp: new Date(`${event.blockTimestamp}Z`).getTime(),
                        price: {
                            quantity: buy?.auction.lastBidAmount
                                ? formatWeiToEther(buy?.auction.lastBidAmount).toFixed(4)
                                : '',
                            price: '1',
                            paymentToken: {
                                name: 'Ether',
                                symbol: 'ETH',
                                decimals: 18,
                                address: buy?.auction.auctionCurrency || '',
                            },
                        },
                        accountPair: {
                            from: {
                                username: buy?.tokenOwner,
                                address: buy?.tokenOwner,
                                imageUrl: '',
                                link: `https://zora.co/${buy?.tokenOwner}`,
                            },
                            to: {
                                username: buy?.winner,
                                address: buy?.winner,
                                imageUrl: '',
                                link: `https://zora.co/${buy?.winner}`,
                            },
                        },
                    }
                }
                return
            },
        )
        return history.filter((event) => event !== undefined)
    }

    async getOffers(tokenAddress: string, tokenId: string) {
        const variables = {
            tokenAddress,
            tokenId,
        }
        const nftBids = await this.client.request(getBidsQuery, variables)
        const offers = nftBids.Token[0].transferEvents.map((event: ZoraBid) => {
            if (event.transaction.marketBidEvents?.length !== 0) {
                const bid = first(event.transaction.marketBidEvents)
                return {
                    created_time: new Date(`${bid?.blockTimestamp}Z`).getTime().toString(),
                    current_price: bid?.amount,
                    payment_token: bid?.currencyAddress || '',
                    payment_token_contract: {
                        name: 'Ether',
                        symbol: 'ETH',
                        decimals: 18,
                        address: bid?.currencyAddress || '',
                    },
                    listing_time: 0,
                    side: OrderSide.Buy,
                    quantity: '1',
                    expiration_time: 0,
                    order_hash: bid?.transactionHash || '',
                    approved_on_chain: false,
                    maker_account: {
                        user: { username: bid?.recipient || '' },
                        address: bid?.recipient || '',
                        profile_img_url: '',
                        link: `https://zora.co/${bid?.recipient}`,
                    },
                }
            }
            return
        })
        return offers.filter((offer) => offer !== undefined)
    }

    async getListings(tokenAddress: string, tokenId: string) {
        const variables = {
            tokenAddress,
            tokenId,
        }
        const nftAsks = await this.client.request(getAsksQuery, variables)
        const orders = nftAsks.Token[0].transferEvents.map((event: ZoraAsk) => {
            if (event.transaction.auctionCreatedEvents?.length !== 0) {
                const ask = first(event.transaction.auctionCreatedEvents)
                return {
                    created_time: new Date(`${ask?.blockTimestamp}Z`).getTime().toString(),
                    approved_on_chain: false,
                    current_price: formatWeiToEther(ask?.reservePrice || 0).toString(),
                    payment_token: ask?.auctionCurrency,
                    payment_token_contract: {
                        name: 'Ether',
                        symbol: 'ETH',
                        decimals: 18,
                        address: ask?.auctionCurrency || '',
                    },
                    listing_time: 0,
                    side: OrderSide.Sell,
                    quantity: '1',
                    expiration_time: 0,
                    order_hash: ask?.transactionHash || '',
                    maker_account: {
                        user: { username: ask?.tokenOwner || '' },
                        address: ask?.tokenOwner || '',
                        profile_img_url: '',
                        link: `https://zora.co/${ask?.tokenOwner}`,
                    },
                }
            }
            return
        })
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

    async getCollectionsByKeyword(
        keyword: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        const collections = await this.client.request<Collection[]>(GetCollectionsByKeywordQuery, {
            keyword,
        })
        if (!collections.length) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const collections_ = collections.map((x) => this.createNonFungibleCollectionFromCollection(chainId, x))
        return createPageable(
            collections_,
            createIndicator(indicator),
            collections_.length ? createNextIndicator(indicator) : undefined,
        )
    }
}
